import axios from "axios";
import { DROPBOX_PATH, DROPBOX_TOKEN } from "src/infrastructure/env"

export interface DownloadResponse {
    result: {
        fileBlob: Blob
    }
}

export class DropboxService {
    private readonly BASE_URL: string = 'https://content.dropboxapi.com/2';

    constructor() {
    }

    async downloadFile(filePath: string): Promise<DownloadResponse> {
        const { data } = await axios.post(
            'files/download',
            {
                path: `${DROPBOX_PATH}/${filePath}`
            },
            { ...this.getDefaultOptions(filePath) },
        );

        return data;
    }

    private getDefaultOptions(filePath: string): any {
        return {
            headers: {
                Authorization: `Bearer ${DROPBOX_TOKEN}`,
                'Content-Type': 'application/json',
            },
            baseURL: this.BASE_URL,
            timeout: 30000,
        }
    }
}