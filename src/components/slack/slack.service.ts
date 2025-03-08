import axios from "axios";
import { SLACK_TOKEN } from "src/infrastructure/env"

export class SlackService {
    private readonly BASE_URL: string = 'https://slack.com/api';

    async sendMessageAsync(message: string, channelId: string): Promise<void> {
        try {
            const body = `text=${message}&token=${SLACK_TOKEN}&channel=${channelId}`;

            await axios.post(
                'chat.postMessage',
                body,
                {
                    baseURL: this.BASE_URL,
                    timeout: 30000,
                    transformRequest(data, headers) {
                        delete headers['Content-Type'];
                        return data;
                      }
                }
            );
        }
        catch (e: any) {
            console.error(e);
        }
    }

    
}