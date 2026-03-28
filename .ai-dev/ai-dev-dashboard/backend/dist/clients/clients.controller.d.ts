import { ClientsService, ClientInfo, ClientDetail, ClientDocContent } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    listClients(): Promise<ClientInfo[]>;
    getClient(id: string): Promise<ClientDetail>;
    getClientDoc(id: string, docPath: string): Promise<ClientDocContent>;
}
