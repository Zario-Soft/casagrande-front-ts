import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ReportContentImageSummary, ReportContentSummary } from './report.interfaces';
import { useState, useEffect } from 'react';
import { ImageDownloader } from '../image-downloader/image-downloader.component';
import { toast } from "react-toastify";

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
        flexDirection: 'column',
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
                </View> : <></>
            })}
        </View>
    </View>
}

// interface ImageContent {
//     content: string,
//     description?: string,
//     index: number
// }

interface ImageContentNovo {
    items: ImageContentNovoItem[],
    description: string
}

interface ImageContentNovoItem {
    content?: string,
    guid: string,
    index: number
}

export function SummaryImageReport(props: ReportContentImageSummaryProps) {
    const [imageContentNovo, setImageContentNovo] = useState<ImageContentNovo[]>([]);
    const imageItemsKey = JSON.stringify(props.imageItems);

    useEffect(() => {
        const imgHandler = new ImageDownloader();

        const getContent = async (guid: string) => {
            try {
                return await imgHandler.downloadOnFront(guid);
            } catch (error) {
                toast.error(`Erro ao baixar a imagems para o relatório.`);
                return undefined;
            }
        }

        const loadImage = async () => {
            const structure: ImageContentNovo[] = props.imageItems!
                .filter(item => item.images.filter(i => !!i).length > 0)
                .map(item => {
                    return {
                        items: item.images
                            .filter(i => !!i?.guid)
                            .map(i => ({
                                index: i!.index,
                                guid: i!.guid
                            })),
                        description: item.description ?? ''
                    } as ImageContentNovo;
                });

            const withContent: ImageContentNovo[] = await Promise.all(
                structure.map(async item => ({
                    ...item,
                    items: await Promise.all(
                        item.items.map(async i => ({
                            ...i,
                            content: await getContent(i.guid)
                        }))
                    )
                }))
            );

            setImageContentNovo(withContent);
        };

        loadImage();

    }, [imageItemsKey])

    return <View wrap break={props.breakPage ?? false}>
        <View style={styles.invoiceSummaryTitle}>
            <Text style={styles.invoiceSummaryTitleLabel}>{props.title ?? 'Dados'}</Text>
        </View>
        <View style={styles.invoiceSummaryBodyImageContainer}>
            {imageContentNovo && imageContentNovo.map((item, key) => {
                return <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <View key={key} style={styles.invoiceClientContainer}>
                        {item.items
                            .sort((a, b) => a.index < b.index ? 1 : -1)
                            .filter(value => !!value.content)
                            .map((value, itemIndex) => {
                                return <View key={itemIndex}>
                                    <Image style={styles.picture} src={value.content} />
                                </View>
                            })}
                    </View>
                    <View style={styles.invoiceClientContainer}>
                        <View style={styles.invoiceClientLineContainer}>
                            <Text style={styles.label}>{item.description}</Text>
                        </View>
                    </View>
                </View>
            })}
        </View>
        {/* <View style={styles.invoiceSummaryBodyImageContainer}>
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
        </View> */}
    </View>
}
