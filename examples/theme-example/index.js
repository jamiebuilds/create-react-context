//@flow
import React from "react";
import { render } from "react-dom";
import { ThemeToggler, Title } from "./theme-context";

const App = () => (
  <ThemeToggler>
    <Title>Really cool context</Title>
  </ThemeToggler>
);

render(<App />, document.getElementById("container"));
