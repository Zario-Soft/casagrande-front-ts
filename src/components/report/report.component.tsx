import { Image, Page, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';

import logo from '../../assets/logo.png';
import { ReportSubtitle, ReportTitle, SummaryImageReport, SummaryReport, SummaryTableReport } from './report-elements';
import { ReportContent, ReportContentBaseSummary, ReportContentImageSummary, ReportContentSummary, ReportContentTableSummary } from './report.interfaces';

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
    /** Texto da janela de PDF */
    screenTitle?: string,
    /** Texto que mostra dentro do formulário, abaixo do CNPJ  */
    reportTitle?: string,
    content?: ReportContent,
}

export default function Report(props: ReportProps) {
     const { content } = props;

    const document = content ? (
        <Document
            author='Casagrande Meias'
            creator='Casagrande Meias'
            title={props.screenTitle ?? 'Relatório'}
        >
            <Page size="A4" style={styles.page}>
                <Image style={styles.logo} src={logo} />
                <ReportSubtitle title="18.371.336/0001-26" />
                <ReportTitle title={props.reportTitle ?? 'Relatório'} />
                {content.summaries && content.summaries.map((item: ReportContentBaseSummary, index: number) => {
                    if ("items" in item) {
                        return <SummaryReport
                            key={index}
                            title={item.title}
                            items={(item as ReportContentSummary).items}
                            breakPage={item.breakPage}
                            visible={item.visible ?? true}
                        />
                    }

                    if ("columns" in item) {
                        return <SummaryTableReport
                            key={index}
                            title={item.title}
                            columns={(item as ReportContentTableSummary).columns}
                            rows={(item as ReportContentTableSummary).rows}
                            breakPage={item.breakPage}
                            visible={item.visible ?? true}
                        />
                    }

                    return <SummaryImageReport
                        key={index}
                        title={item.title}
                        images={(item as ReportContentImageSummary).images}
                        imageItems={(item as ReportContentImageSummary).imageItems}
                        breakPage={item.breakPage}
                        visible={item.visible ?? true}
                        description={item.description}
                    />
                })
                }

            </Page>
        </Document>
    ) : <Document />;

    return (
        <PDFViewer
            width={props.width ?? '100%'}
            height="600px"
            key={'report-id'}
        >
            {document}
        </PDFViewer>
    );
}
