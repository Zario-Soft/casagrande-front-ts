import { Dropbox } from 'dropbox';
import { DROPBOX_TOKEN, DROPBOX_PATH } from 'src/infrastructure/env';

export class ImageDownloader {
    private readonly drop: Dropbox;

    constructor() {
            this.drop = new Dropbox({ accessToken: DROPBOX_TOKEN });
    }

    async downloadOnFront(uniqueName?: string, name?: string): Promise<string | undefined> {
        if (uniqueName) {
            var photoContent = localStorage.getItem(uniqueName);
            if (photoContent) return photoContent;
        }

        if (!name || name === '') return undefined;

        try {
            const path_lower = `${DROPBOX_PATH}/${name}`;
            const extension = name.split(".")[1];

            const downloadedImage = await this.drop.filesDownload({ path: path_lower })
            
            const base64Img = await this.blobToBase64((downloadedImage.result as any).fileBlob);

            return base64Img.replace("data:application/octet-stream", `data:image/${extension}`);
        } catch { }

        return undefined;
    }

    downloadOnFrontMountingName(prefix: string, photoname: string) {
        const uniqueName = `${prefix}-${photoname}`;

        return this.downloadOnFront(uniqueName, photoname)
    }

    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    }
};