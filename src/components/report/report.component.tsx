import { Image, Page, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';

import logo from '../../assets/logo.png';
import { ReportSubtitle, ReportTitle, SummaryImageReport, SummaryReport } from './report-elements';
import { ReportContent, ReportContentBaseSummary, ReportContentImageSummary, ReportContentSummary } from './report.interfaces';
import { useEffect, useState } from 'react';

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
    onLoadContent: () => Promise<ReportContent>,
}

export default function Report(props: ReportProps) {
    const { onLoadContent } = props;

    const [content, setContent] = useState<ReportContent>();

    useEffect(() => {
        onLoadContent()
            .then(c => setContent(c))
    }, [onLoadContent]);

    const GeneralDocument = () => (
        <>{content ? <Document
            author='Casagrande Meias'
            creator='Casagrande Meias'
            title={props.title ?? 'Relatório'}
        >
            <Page size="A4" style={styles.page}>
                <Image style={styles.logo} src={logo} />
                <ReportSubtitle title="18.371.336/0001-26" />
                <ReportTitle title={props.title ?? 'Relatório'} />
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

                    return <SummaryImageReport
                        key={index}
                        title={item.title}
                        images={(item as ReportContentImageSummary).images}
                        breakPage={item.breakPage}
                        visible={item.visible ?? true}
                    />
                })
                }

            </Page>
        </Document>
            : <></>}
        </>
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