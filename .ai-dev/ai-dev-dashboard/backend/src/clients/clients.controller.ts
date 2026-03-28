import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ClientsService, ClientInfo, ClientDetail, ClientDocContent } from './clients.service';

@ApiTags('clients')
@Controller('api/clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Get()
    @ApiOperation({ summary: 'List all clients' })
    listClients(): Promise<ClientInfo[]> {
        return this.clientsService.listClients();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get client details and document list' })
    @ApiParam({ name: 'id', description: 'Client ID (e.g. 001)' })
    getClient(@Param('id') id: string): Promise<ClientDetail> {
        return this.clientsService.getClient(id);
    }

    @Get(':id/docs/:docPath(*)')
    @ApiOperation({ summary: 'Get client document content' })
    @ApiParam({ name: 'id', description: 'Client ID' })
    @ApiParam({ name: 'docPath', description: 'Relative path to doc within client folder' })
    getClientDoc(
        @Param('id') id: string,
        @Param('docPath') docPath: string,
    ): Promise<ClientDocContent> {
        return this.clientsService.getClientDoc(id, docPath);
    }
}
