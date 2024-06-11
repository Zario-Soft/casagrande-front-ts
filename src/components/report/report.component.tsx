import { Image, Page, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';

import logo from '../../assets/logo.png';
import { ReportSubtitle, ReportTitle, SummaryReport } from './report-elements';
import { ReportContent, ReportContentSummary } from './report.interfaces';

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 11,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 60,
        paddingRight: 60,
        lineHeight: 1.5,
        flexDirection: 'column',
    },
    logo: {
        width: 64,
        height: 56,
        marginLeft: 'auto',
        marginRight: 'auto'
    }
});

interface ReportProps {
    width?: number,
    title?: string,
    onLoadContent: () => ReportContent,
}

export default function Report(props: ReportProps) {
    const { onLoadContent } = props;

    const content = onLoadContent();

    const GeneralDocument = () => (
        <Document
            author='Diego Reis'
            creator='Diego Reis'
            title={props.title ?? 'Relatório'}
        >
            <Page size="A4" style={styles.page}>
                <Image style={styles.logo} src={logo} />
                <ReportSubtitle title="Tropa da Vê" />
                <ReportTitle title={props.title ?? 'Relatório'} />
                {content.summaries && content.summaries.map((item: ReportContentSummary, index: number) => {
                    //return item.
                    return <SummaryReport
                        key={index}
                        title={item.title}
                        items={item.items}
                        break={item.breakPage}
                        visible={item.visible ?? true}
                    />
                })
                }

            </Page>
        </Document>
    );

    return (
        <PDFViewer
            width={props.width ?? '100%'}
            height="600px"
            key={'report-id'}
        >
            <GeneralDocument />
        </PDFViewer>
    );
}