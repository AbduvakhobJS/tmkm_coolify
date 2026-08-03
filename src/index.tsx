import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import './App.css';
import { SciChartSurface } from "scichart";
import Parts from "./components/Parts";
import Part1 from "./components/Part1";
import Part2 from "./components/Part2";
import Part3 from "./components/Part3";
import Part4 from "./components/Part4";
import ProjectDashboard from "./components/ProjectDashboard";
import Part5 from "./components/Part5";
import EnterExit from "./components/EnterExit";
import StModal from "./components/StModal";
import HseSla from "./Parts/Hse/HseSla";
import LoginPage from "./components/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import HseSlaBig from "./Parts/Hse/HseSlaBig";
import Marketing from "./Parts/Marketing/Marketing";
import MarketingDetail from "./Parts/Marketing/MarketingDetail";
import PrMedia from "./Parts/PrMedia/PrMedia";
import PrMediaDetail from "./Parts/PrMedia/PrMediaDetail";
import HrAnalitikaDetail from "./Parts/HrAnalitika/HrAnalitikaDetail";
import HrAnalitika from "./Parts/HrAnalitika/HrAnalitika";
import ContactHubDetail from "./Parts/ContactHub/ContactHubDetail";
import ContactHub from "./Parts/ContactHub/ContactHub";
import Esg from "./Parts/ESG/ESG";
import EsgDetail from "./Parts/ESG/ESGDetail";
import ConstuctorPage from "./Parts/ConstuctorPage/ConstuctorPage";
import ResourceDashboard from "./components/ResourceDashboard";
import Finance from "./Parts/Finance/Finance";
import Investing from "./Parts/Investing/Investing";
import NewHrDetail from "./Parts/HrAnalitika/NewHrDetail";
import FinanceNew from "./Parts/Finance/FinanceNew";
import SingleTreasury from "./Parts/SingleTreasury/SingleTreasury";
import Grr from "./Parts/GRR/GRR";
import GrrDetail from "./Parts/GRR/GrrDetail";
import ConstuctorPageFour from "./Parts/ConstuctorPage/ConstuctorPageFour";
import FactoryModel from "./Parts/FactoryModel/FactoryModel";
import EnterExitMain from "./components/EnterExitMain";
import FinanceNewMain from "./Parts/Finance/FinanceNewMain";
import Birja from "./Parts/Finance/Birja";
import Logistics from "./Parts/Logistics/Logistics";
SciChartSurface.setRuntimeLicenseKey("NbX+2XP9JhtSxLiFXWZHRkPfQJz1ladswS9bZa9nR+HQYgAvAQ+qGVaNrxbIHiFYjIkf7WbsQcgKkk5dIOar27oI78ndSaTKtUGcIg3QG1LphEcW7+M3az5rma0vDbjxz3MX4dN3r3+HnYK50ErzErnLx7kzUYYZRmZOgPiMIP/bnVLp1I07eKJv4J7pHGbf2/5Sz/+staHCf8OscRw0lOaodXWOybw9gigzKZpp9QBJbJr9b2YINi6sRikakhwRQ5RnW838qqTvxbbcPaRLjqp7+0tZlU3KQ2351+Hz96EMFZwKN2TdRYCZO1ARHp57eck+8M+9fUDcSEo0NzgdCTe3bZ6tXepsOyUIgwMFY8s9WWwvRScewcS2pFG1DCun2HvSC/G5rCaoAjFYuXhi3zx/Znx8qY5YNCGRI6uuBgHqJDDuZflM2Ot2XSl5PtatddhWogw97AeFUEbNAO3WNuUyPweKYSFAfhdlzfRof+3ZRxCtI7Wv6M269RGDToZJniFgn9Pw6mf+d3DVnz+RSj4/16eCI4ZUDeQJg/dfD/kefdNpa/+B22DexowqOjtjmR7ECgBktFN0Pq46enu+6Z0b9WphqUt7i62+9PD7ctHFJYqLfzwaHBrOG0VdpGRX7hoBHv4L9RaqEJ8kzEUswRuKkyKnwghr");

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const queryClient = new QueryClient()

root.render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/main" element={<PrivateRoute><Parts /></PrivateRoute>} />
          <Route path="/main/full" element={<PrivateRoute><App /></PrivateRoute>} />
          <Route path="/main/1" element={<PrivateRoute><Part1 /></PrivateRoute>} />
          <Route path="/main/2" element={<PrivateRoute><Part2 /></PrivateRoute>} />
          <Route path="/main/4" element={<PrivateRoute><Part4 /></PrivateRoute>} />
          <Route path="/main/5" element={<PrivateRoute><ProjectDashboard /></PrivateRoute>} />
          <Route path="/main/6" element={<PrivateRoute><Part5 /></PrivateRoute>} />
          <Route path="/main/7" element={<PrivateRoute><EnterExit /></PrivateRoute>} />
          <Route path="/main/71" element={<PrivateRoute><EnterExitMain /></PrivateRoute>} />
          <Route path="/main/8" element={<PrivateRoute><StModal /></PrivateRoute>} />
          <Route path="/main/9" element={<PrivateRoute><ResourceDashboard /></PrivateRoute>} />
          <Route path="/main/logistics" element={<PrivateRoute><Logistics /></PrivateRoute>} />
          <Route path="/main/pr-media" element={<PrivateRoute><PrMedia /></PrivateRoute>} />
          <Route path="/main/pr-media-detail" element={<PrivateRoute><PrMediaDetail /></PrivateRoute>} />
          <Route path="/main/hse-big" element={<PrivateRoute><HseSlaBig /></PrivateRoute>} />
          <Route path="/main/hse" element={<PrivateRoute><HseSla /></PrivateRoute>} />
          <Route path="/main/marketing" element={<PrivateRoute><Marketing /></PrivateRoute>} />
          <Route path="/main/marketing-detail" element={<PrivateRoute><MarketingDetail /></PrivateRoute>} />
          <Route path="/main/hr-bi-detail" element={<PrivateRoute><HrAnalitikaDetail /></PrivateRoute>} />
          <Route path="/main/hr-bi-main" element={<PrivateRoute><HrAnalitika /></PrivateRoute>} />
          <Route path="/main/new-hr-detail" element={<PrivateRoute><NewHrDetail /></PrivateRoute>} />
          <Route path="/main/contact-hub-detail" element={<PrivateRoute><ContactHubDetail /></PrivateRoute>} />
          <Route path="/main/contact-hub" element={<PrivateRoute><ContactHub /></PrivateRoute>} />
          <Route path="/main/esg" element={<PrivateRoute><Esg /></PrivateRoute>} />
          <Route path="/main/esg-detail" element={<PrivateRoute><EsgDetail /></PrivateRoute>} />
          <Route path="/main/finance" element={<PrivateRoute><Finance /></PrivateRoute>} />
          <Route path="/main/finance-new" element={<PrivateRoute><FinanceNew /></PrivateRoute>} />
          <Route path="/main/finance-new-main" element={<PrivateRoute><FinanceNewMain /></PrivateRoute>} />
          <Route path="/main/birja" element={<PrivateRoute><Birja /></PrivateRoute>} />
          <Route path="/main/investing" element={<PrivateRoute><Investing /></PrivateRoute>} />
          <Route path="/main/single-treasury" element={<PrivateRoute><SingleTreasury /></PrivateRoute>} />
          <Route path="/main/grr" element={<PrivateRoute><Grr /></PrivateRoute>} />
          <Route path="/main/grr-detail" element={<PrivateRoute><GrrDetail /></PrivateRoute>} />
          <Route path="/main/factory-model" element={<PrivateRoute><FactoryModel /></PrivateRoute>} />
          <Route path="/main/constructor" element={<PrivateRoute><ConstuctorPage /></PrivateRoute>} />
          <Route path="/main/constructor-four" element={<PrivateRoute><ConstuctorPageFour /></PrivateRoute>} />
        </Routes>
  </BrowserRouter>
    </QueryClientProvider>
);
