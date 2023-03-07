import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { AuthGuard } from "~/components/AuthGuard";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>GameServer Mockup</title>
        <meta name="description" content="A mock-up that connects to a native c++ websocket server." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {
        //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Component.requireAuth ? (
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
        ) : (
          // public page
          <Component {...pageProps} />
        )}
      <Footer />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
