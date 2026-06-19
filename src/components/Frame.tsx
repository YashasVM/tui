import React from "react";
import {Box, Text} from "ink";
import type {Theme} from "../theme.js";

type Props = {
  title?: string;
  theme: Theme;
  children: React.ReactNode;
};

export function Frame({title, theme, children}: Props): React.ReactElement {
  return (
    <Box flexDirection="column" borderStyle="single" borderColor={theme.border} paddingX={1}>
      {title ? (
        <Box marginBottom={1}>
          <Text color={theme.muted}>[</Text>
          <Text color={theme.accent}>{title}</Text>
          <Text color={theme.muted}>]</Text>
        </Box>
      ) : null}
      {children}
    </Box>
  );
}
