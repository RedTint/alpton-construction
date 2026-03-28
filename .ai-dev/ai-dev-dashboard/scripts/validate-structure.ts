#!/usr/bin/env npx ts-node
/**
 * validate-structure.ts
 *
 * Validates the docs/epics/ directory structure created by the /migrate skill.
 * Checks: directory naming, epic.md frontmatter, status subdirs, story file naming,
 * story frontmatter, UAC checklist format, and orphan file detection.
 *
 * Usage:
 *   npx ts-node scripts/validate-structure.ts [--docs-path=../docs]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as matter from 'gray-matter';

// ─── Config ────────────────────────────────────────────────────────
const STATUS_DIRS = ['pending', 'in-progress', 'qa', 'done', 'blocked'];
const EPIC_DIR_PATTERN = /^\d{3}-epic-.+$/;
const STORY_FILE_PATTERN = /^\d{3}\.\d{3}-.+\.md$/;
const REQUIRED_EPIC_FM = ['id', 'title', 'status'];
const REQUIRED_STORY_FM = ['id', 'title', 'status'];
const UAC_CHECKBOX_PATTERN = /^- \[([ x])\] /;

// ─── Types ─────────────────────────────────────────────────────────
interface ValidationError {
    path: string;
    rule: string;
    message: string;
    severity: 'error' | 'warning';
}

interface ValidationResult {
    epicsChecked: number;
    storiesChecked: number;
    errors: ValidationError[];
    warnings: ValidationError[];
    passed: boolean;
}

// ─── Validator ─────────────────────────────────────────────────────
export function validateStructure(docsPath: string): ValidationResult {
    const epicsPath = path.join(docsPath, 'epics');
    const result: ValidationResult = {
        epicsChecked: 0,
        storiesChecked: 0,
        errors: [],
        warnings: [],
        passed: true,
    };

    // Check epics directory exists
    if (!fs.existsSync(epicsPath)) {
        result.errors.push({
            path: epicsPath,
            rule: 'epics-dir-exists',
            message: 'docs/epics/ directory does not exist. Run /migrate first.',
            severity: 'error',
        });
        result.passed = false;
        return result;
    }

    // Get all entries in epics directory
    const entries = fs.readdirSync(epicsPath);

    for (const entry of entries) {
        const entryPath = path.join(epicsPath, entry);
        const stat = fs.statSync(entryPath);

        // Non-directories in epics/ are orphans
        if (!stat.isDirectory()) {
            result.warnings.push({
                path: entryPath,
                rule: 'no-orphan-files',
                message: `Orphan file in epics root: ${entry}`,
                severity: 'warning',
            });
            continue;
        }

        // Validate epic directory name
        if (!EPIC_DIR_PATTERN.test(entry)) {
            result.errors.push({
                path: entryPath,
                rule: 'epic-dir-naming',
                message: `Epic directory does not match pattern {###}-epic-{name}/: ${entry}`,
                severity: 'error',
            });
            continue;
        }

        result.epicsChecked++;

        // Validate epic.md exists and has frontmatter
        const epicMdPath = path.join(entryPath, 'epic.md');
        if (!fs.existsSync(epicMdPath)) {
            result.errors.push({
                path: epicMdPath,
                rule: 'epic-md-exists',
                message: `Missing epic.md in ${entry}/`,
                severity: 'error',
            });
        } else {
            validateFrontmatter(epicMdPath, REQUIRED_EPIC_FM, 'epic', result);
        }

        // Validate status subdirs exist
        for (const status of STATUS_DIRS) {
            const statusDir = path.join(entryPath, status);
            if (!fs.existsSync(statusDir)) {
                result.warnings.push({
                    path: statusDir,
                    rule: 'status-dir-exists',
                    message: `Missing status directory: ${entry}/${status}/`,
                    severity: 'warning',
                });
            }
        }

        // Check for orphan files (non-status dirs, non-epic.md)
        const epicContents = fs.readdirSync(entryPath);
        for (const item of epicContents) {
            if (item === 'epic.md') continue;
            const itemPath = path.join(entryPath, item);
            const itemStat = fs.statSync(itemPath);

            if (itemStat.isFile()) {
                result.warnings.push({
                    path: itemPath,
                    rule: 'no-orphan-files',
                    message: `Orphan file outside status directory: ${entry}/${item}`,
                    severity: 'warning',
                });
            } else if (itemStat.isDirectory() && !STATUS_DIRS.includes(item)) {
                result.warnings.push({
                    path: itemPath,
                    rule: 'valid-status-dir',
                    message: `Unexpected subdirectory: ${entry}/${item}/ (expected: ${STATUS_DIRS.join(', ')})`,
                    severity: 'warning',
                });
            }
        }

        // Validate story files in each status dir
        for (const status of STATUS_DIRS) {
            const statusDir = path.join(entryPath, status);
            if (!fs.existsSync(statusDir)) continue;

            const files = fs.readdirSync(statusDir).filter(f => f.endsWith('.md'));
            for (const file of files) {
                result.storiesChecked++;
                const filePath = path.join(statusDir, file);

                // Validate filename pattern
                if (!STORY_FILE_PATTERN.test(file)) {
                    result.warnings.push({
                        path: filePath,
                        rule: 'story-file-naming',
                        message: `Story file does not match {epic}.{story}-{name}.md: ${file}`,
                        severity: 'warning',
                    });
                }

                // Validate frontmatter
                validateFrontmatter(filePath, REQUIRED_STORY_FM, 'story', result);

                // Validate UAC checklist format
                validateUACFormat(filePath, result);
            }
        }
    }

    result.passed = result.errors.length === 0;
    return result;
}

function validateFrontmatter(
    filePath: string,
    requiredFields: string[],
    type: string,
    result: ValidationResult,
): void {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(content);

        if (!data || Object.keys(data).length === 0) {
            result.errors.push({
                path: filePath,
                rule: `${type}-has-frontmatter`,
                message: `Missing YAML frontmatter in ${path.basename(filePath)}`,
                severity: 'error',
            });
            return;
        }

        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                result.errors.push({
                    path: filePath,
                    rule: `${type}-fm-${field}`,
                    message: `Missing required frontmatter field '${field}' in ${path.basename(filePath)}`,
                    severity: 'error',
                });
            }
        }
    } catch (err) {
        result.errors.push({
            path: filePath,
            rule: `${type}-parseable`,
            message: `Failed to parse ${path.basename(filePath)}: ${(err as Error).message}`,
            severity: 'error',
        });
    }
}

function validateUACFormat(filePath: string, result: ValidationResult): void {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        let hasChecklists = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!;
            // Check for checklist items
            if (line.match(/^- \[/)) {
                hasChecklists = true;
                if (!UAC_CHECKBOX_PATTERN.test(line)) {
                    result.warnings.push({
                        path: filePath,
                        rule: 'uac-checkbox-format',
                        message: `Line ${i + 1}: Checklist item doesn't use standard [ ]/[x] format: "${line.trim()}"`,
                        severity: 'warning',
                    });
                }
            }
        }

        // It's fine if a story has no checklists — they might not have UACs added yet
        if (!hasChecklists) {
            // Not an error, just informational
        }
    } catch {
        // Already reported as parse error above
    }
}

// ─── CLI Entry ─────────────────────────────────────────────────────
function main(): void {
    const args = process.argv.slice(2);
    const docsPathArg = args.find(a => a.startsWith('--docs-path='));
    const docsPath = docsPathArg
        ? docsPathArg.split('=')[1]!
        : path.join(__dirname, '..', '..', 'docs');

    console.log(`\n🔍 Validating structure at: ${path.resolve(docsPath)}\n`);

    const result = validateStructure(docsPath);

    // Print results
    console.log(`📊 Results:`);
    console.log(`   Epics checked:   ${result.epicsChecked}`);
    console.log(`   Stories checked:  ${result.storiesChecked}`);
    console.log(`   Errors:           ${result.errors.length}`);
    console.log(`   Warnings:         ${result.warnings.length}`);
    console.log('');

    if (result.errors.length > 0) {
        console.log('❌ Errors:');
        for (const err of result.errors) {
            console.log(`   [${err.rule}] ${err.message}`);
        }
        console.log('');
    }

    if (result.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        for (const warn of result.warnings) {
            console.log(`   [${warn.rule}] ${warn.message}`);
        }
        console.log('');
    }

    if (result.passed) {
        console.log('✅ Structure validation passed!\n');
    } else {
        console.log('❌ Structure validation failed. Fix errors above.\n');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}
