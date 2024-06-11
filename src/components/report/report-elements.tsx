import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportContentSummary } from './report.interfaces';

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