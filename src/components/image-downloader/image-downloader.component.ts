
import { DropboxService } from './dropbox.service';

export class ImageDownloader {
    private readonly drop: DropboxService;

    constructor() {
            this.drop = new DropboxService();
    }

    async downloadOnFront(name?: string): Promise<string | undefined> {
        if (!name || name === '') return undefined;

        try {
            const extension = name.split(".")[1];

            const downloadedImage = await this.drop.downloadFile(name)
            
            const base64Img = await this.blobToBase64(downloadedImage.result.fileBlob);

            return base64Img.replace("data:application/octet-stream", `data:image/${extension}`);
        } catch { }

        return undefined;
    }

    downloadOnFrontMountingName(photoname: string) {
        return this.downloadOnFront(photoname)
    }

    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    }
};