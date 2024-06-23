import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportContentSummary } from './report.interfaces';
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

export type ReportContentSummaryProps = ReportContentSummary & {
    break?: boolean,
    visible?: boolean,
}

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
export function SummaryImageInvoice(props: ReportContentSummaryProps) {
    /*  title
        description
        images: []
    */
    const [imageContent, setImageContent] = useState();
    const imgHandler = new ImageDownloader();

    useEffect(() => {
        loadImage();
        // eslint-disable-next-line
    }, [props.image])

    const loadImage = async () => {

        const localImages = await (props.images ?? [])
            .filter(image => image !== null && image !== undefined)
            .map(async image => image.indexOf('data:image') >= 0
                ? image
                : await imgHandler.downloadOnFront(image, image))

        await setImageContent(localImages);
    }

    return <View wrap break={props.break ?? false}>
        <View style={styles.invoiceSummaryTitle}>
            <Text style={styles.invoiceSummaryTitleLabel}>{props.title ?? 'Dados'}</Text>
        </View>
        <View style={styles.invoiceSummaryBodyContainer}>
            {imageContent && <View style={styles.invoiceClientContainer}>
                {imageContent.map((image, key) => {
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