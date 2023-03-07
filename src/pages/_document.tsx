import { Html, Head, Main, NextScript } from 'next/document'
import Document, { type DocumentContext, type DocumentInitialProps } from 'next/document'



class MyDocument extends Document {
    static async getInitialProps(
        ctx: DocumentContext
    ): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx)

        return initialProps
    }

    render() {
        return (
            <Html className="bg-gradient-to-tr from-[#591a5a] to-[#2c8b8b] scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-purple-300 scrollbar-thumb-rounded-lg">
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}


export default MyDocument
