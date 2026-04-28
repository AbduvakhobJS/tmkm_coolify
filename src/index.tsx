import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { SciChartSurface } from "scichart";
import TestGrid from "./components/TestGrid";
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
SciChartSurface.setRuntimeLicenseKey("NbX+2XP9JhtSxLiFXWZHRkPfQJz1ladswS9bZa9nR+HQYgAvAQ+qGVaNrxbIHiFYjIkf7WbsQcgKkk5dIOar27oI78ndSaTKtUGcIg3QG1LphEcW7+M3az5rma0vDbjxz3MX4dN3r3+HnYK50ErzErnLx7kzUYYZRmZOgPiMIP/bnVLp1I07eKJv4J7pHGbf2/5Sz/+staHCf8OscRw0lOaodXWOybw9gigzKZpp9QBJbJr9b2YINi6sRikakhwRQ5RnW838qqTvxbbcPaRLjqp7+0tZlU3KQ2351+Hz96EMFZwKN2TdRYCZO1ARHp57eck+8M+9fUDcSEo0NzgdCTe3bZ6tXepsOyUIgwMFY8s9WWwvRScewcS2pFG1DCun2HvSC/G5rCaoAjFYuXhi3zx/Znx8qY5YNCGRI6uuBgHqJDDuZflM2Ot2XSl5PtatddhWogw97AeFUEbNAO3WNuUyPweKYSFAfhdlzfRof+3ZRxCtI7Wv6M269RGDToZJniFgn9Pw6mf+d3DVnz+RSj4/16eCI4ZUDeQJg/dfD/kefdNpa/+B22DexowqOjtjmR7ECgBktFN0Pq46enu+6Z0b9WphqUt7i62+9PD7ctHFJYqLfzwaHBrOG0VdpGRX7hoBHv4L9RaqEJ8kzEUswRuKkyKnwghr");

root.render(

  <>
      {/*<TestGrid/>*/}
    <App />
  </>
);
