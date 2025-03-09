import axios from "axios";
import { TRELLO_API_KEY, TRELLO_TOKEN } from "src/infrastructure/env"

export interface CardRequest {
    id?: string;
    name: string;
    desc: string;
    listId?: string;

}

export class TrelloService {
    private readonly BASE_URL: string = 'https://api.trello.com/1';

    async createCardAsync(card: CardRequest): Promise<string> {
        const response = await axios.post(
            'cards',
            undefined,
            {
                baseURL: this.BASE_URL,
                timeout: 30000,
                responseType: 'json',
                params: {
                    ...this.getDefaultParams(),
                    'pos': 'top',
                    'name': card.name,
                    'idList': card.listId,
                    'desc': card.desc,
                },
            },
        );

        return response.data.id;
    }

    async addCardChecklistAsync(cardId: string, checklistId: string): Promise<void> {
        await axios.post(
            `cards/${cardId}/checklist`,
            undefined,
            {
                baseURL: this.BASE_URL,
                timeout: 30000,
                responseType: 'json',
                params: {
                    ...this.getDefaultParams(),
                    'pos': 'top',
                    'idChecklistSource': checklistId,
                },
            },
        );
    }

    async updateCardAsync(card: CardRequest): Promise<void> {
        if (!card.id) return;

        await axios.put(
            `cards/${card.id}`,
            undefined,
            {
                baseURL: this.BASE_URL,
                timeout: 30000,
                responseType: 'json',
                params: {
                    ...this.getDefaultParams(),
                    'name': card.name,
                    'desc': card.desc,
                },
            },
        );
    }

    async addAttachmentAsync(cardId: string, fileBase64: string, name: string, setCover: boolean = false): Promise<string> {
        let data = new FormData();
        data.append('file', this.dataURIToBlob(fileBase64), name);

        const response = await axios.post(
            `cards/${cardId}/attachments`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                baseURL: this.BASE_URL,
                timeout: 30000,
                maxBodyLength: Infinity,
                responseType: 'json',
                params: {
                    ...this.getDefaultParams(),
                    'setCover': setCover,
                    'name': name,
                },
            },
        );

        return response.data.id;
    }

    async updateAttachmentAsync(cardId: string, fileBase64: string, name: string, setCover: boolean = false): Promise<void> {
        const attachments = await axios.get(
            `cards/${cardId}/attachments`,
            {
                baseURL: this.BASE_URL,
                timeout: 30000,
                responseType: 'json',
                params: {
                    ...this.getDefaultParams()
                },
            },
        );

        if (attachments.data)
            attachments.data.forEach(async (attachment: { id: string }) => {
                await axios.delete(
                    `cards/${cardId}/attachments/${attachment.id}`,
                    {
                        baseURL: this.BASE_URL,
                        timeout: 30000,
                        responseType: 'json',
                        params: {
                            ...this.getDefaultParams()
                        },
                    },
                );
            });


        await this.addAttachmentAsync(cardId, fileBase64, name, setCover);
    }

    private getDefaultParams() {
        return {
            'key': TRELLO_API_KEY,
            'token': TRELLO_TOKEN,
        }
    }

    private dataURIToBlob(imageBase64: string) {
        const splitDataURI = imageBase64.split(',')
        const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
        const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

        const ia = new Uint8Array(byteString.length)
        for (let i = 0; i < byteString.length; i++)
            ia[i] = byteString.charCodeAt(i)

        return new Blob([ia], { type: mimeString })
    }
}