import axios from "axios";
import { DROPBOX_PATH, DROPBOX_TOKEN } from "src/infrastructure/env"

export class DropboxService {
    private readonly BASE_URL: string = 'https://content.dropboxapi.com/2';

    async downloadFile(filePath: string): Promise<Blob> {
        const response = await axios.post(
            'files/download',
            undefined,
            {
                headers: {
                    ...this.getDefaultHeaders(),
                    'Dropbox-API-Arg': `{"path": "${DROPBOX_PATH}/${filePath}"}`,
                },
                baseURL: this.BASE_URL,
                timeout: 30000,
                responseType: 'arraybuffer'
            },
        );

        return new Blob([response.data]);
    }

    private getDefaultHeaders() {
        return {
            Authorization: `Bearer ${DROPBOX_TOKEN}`,
        }
    }

    private getDefaultOptions(filePath: string): any {
        return {
            headers: {
                ...this.getDefaultHeaders(),
                'Dropbox-API-Arg': `{"path": "${DROPBOX_PATH}/${filePath}"}`,
            },
            baseURL: this.BASE_URL,
            timeout: 30000,
        }
    }
}