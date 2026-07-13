import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormProvider } from "@/context/FormContext";
import ApplicationBridge from "@/components/ApplicationBridge";
import HomePage from "@/pages/HomePage";
import RegisterPage from "@/pages/RegisterPage";
import PaymentPage from "@/pages/PaymentPage";
import CardPage from "@/pages/CardPage";
import OtpPage from "@/pages/OtpPage";
import BenefitsPage from "@/pages/BenefitsPage";
import SuccessPage from "@/pages/SuccessPage";
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/card" component={CardPage} />
      <Route path="/otp" component={OtpPage} />
      <Route path="/benefits" component={BenefitsPage} />
      <Route path="/success" component={SuccessPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ApplicationBridge />
          <Router />
        </WouterRouter>
      </FormProvider>
    </QueryClientProvider>
  );
}

export default App;
