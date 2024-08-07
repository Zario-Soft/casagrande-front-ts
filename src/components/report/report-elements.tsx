import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ReportContentImageSummary, ReportContentSummary } from './report.interfaces';
import { useState, useEffect } from 'react';
import { ImageDownloader } from '../image-downloader/image-downloader.component';

const styles = StyleSheet.create({

    titleContainer: {
        flexDirection: 'row',
        marginTop: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    reportTitle: {
        color: '#282c34',
        letterSpacing: 4,
        fontSize: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    reportSubTitle: {
        color: '#282c34',
        letterSpacing: 4,
        fontSize: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
    },

    invoiceSummaryBodyContainer: {
        flexDirection: 'column',
        marginTop: 6,
        marginRight: 10,
        marginLeft: 2,
        borderStyle: 'solid',
        borderWidth: '3px',
        justifyContent: 'flex-start'
    },

    invoiceSummaryBodyImageContainer: {
        flexDirection: 'row',
        marginTop: 6,
        borderStyle: 'solid',
        borderWidth: '3px',
        justifyContent: 'space-around'
    },

    invoiceClientContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },

    invoiceClientLineContainer: {
        flexDirection: 'row',
        marginTop: 4,
        marginLeft: 3,
        justifyContent: 'flex-start'
    },
    invoiceDateContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    label: {
        fontSize: 12,
        fontStyle: 'bold',
    },

    invoiceSummaryTitle: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    invoiceSummaryTitleLabel: {

        fontSize: 14,
        color: '#b71c1c',
        fontStyle: 'bold',
    },

    picture: {
        width: 100,
        height: 135,
        marginLeft: 5,
        marginTop: 5,
    }
});

export const ReportTitle = ({ title }: { title: string }) => (
    <View style={styles.titleContainer}>
        <Text style={styles.reportTitle}>{title}</Text>
    </View>
);

export const ReportSubtitle = ({ title }: { title: string }) => (
    <View style={styles.titleContainer}>
        <Text style={styles.reportSubTitle}>{title}</Text>
    </View>
);

export type ReportContentSummaryProps = ReportContentSummary;
export type ReportContentImageSummaryProps = ReportContentImageSummary;

export function SummaryReport(props: ReportContentSummaryProps) {
    //title, items: title, value
    return <View wrap break={props.breakPage ?? false}>
        <View style={styles.invoiceSummaryTitle}>
            <Text style={styles.invoiceSummaryTitleLabel}>{props.title ?? 'Dados'}</Text>
        </View >
        <View style={styles.invoiceSummaryBodyContainer}>
            {props.items && props.items.map((item, key) => {
                return item.visible === undefined || item.visible === true ? <View key={key}
                    style={styles.invoiceClientLineContainer}>
                    {item.title && <Text style={styles.label}>{item.title}</Text>}
                    <Text style={{ fontSize: item.fontSize ?? 12 }}>{item.value}</Text>
                </View > : <></>
            })}
        </View>
    </View>
}

interface ImageContent {
    content: string,
    index: number
}

export function SummaryImageReport(props: ReportContentImageSummaryProps) {
    const [imageContent, setImageContent] = useState<ImageContent[]>();

    useEffect(() => {
        const imgHandler = new ImageDownloader();
        const loadImage = async () => {

            const validImages = props.images
                .filter(image => image !== null && image !== undefined);

            let localImages: ImageContent[] = [];

            await validImages.forEach(async img => {
                const result = await imgHandler.downloadOnFront(img!.guid)
                if (result) {
                    localImages = [...localImages, { content: result!, index: img!.index }];
                    await setImageContent(localImages);
                }
            });
        };

        loadImage();

    }, [props])

    return <View wrap break={props.breakPage ?? false}>
        <View style={styles.invoiceSummaryTitle}>
            <Text style={styles.invoiceSummaryTitleLabel}>{props.title ?? 'Dados'}</Text>
        </View>
        <View style={styles.invoiceSummaryBodyImageContainer}>
            {imageContent && <View style={styles.invoiceClientContainer}>
                {imageContent.sort((a, b) => a.index < b.index ? 1 : -1).map(({ content: image }: ImageContent, key) => {
                    return <View key={key}>
                        <Image style={styles.picture} src={image} />
                    </View>
                })}
            </View>}
            <View style={styles.invoiceClientContainer}>
                <View style={styles.invoiceClientLineContainer}>
                    <Text style={styles.label}>{props.description}</Text>
                </View >
            </View>
        </View>
    </View>
}