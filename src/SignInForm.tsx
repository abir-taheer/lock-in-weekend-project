"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Stack,
} from "@mui/material";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Invalid password. Please try again.";
            } else {
              toastTitle =
                flow === "signIn"
                  ? "Could not sign in, did you mean to sign up?"
                  : "Could not sign up, did you mean to sign in?";
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <Stack spacing={2}>
          <TextField
            type="email"
            name="email"
            placeholder="Email"
            label="Email"
            required
            fullWidth
            variant="outlined"
          />
          <TextField
            type="password"
            name="password"
            placeholder="Password"
            label="Password"
            required
            fullWidth
            variant="outlined"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting}
            sx={{ py: 1.5 }}
          >
            {flow === "signIn" ? "Sign in" : "Sign up"}
          </Button>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" component="span">
              {flow === "signIn"
                ? "Don't have an account? "
                : "Already have an account? "}
            </Typography>
            <Button
              type="button"
              variant="text"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              sx={{ textTransform: "none", p: 0, minWidth: 0 }}
            >
              {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
            </Button>
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>
      <Button
        variant="contained"
        fullWidth
        onClick={() => void signIn("anonymous")}
        sx={{ py: 1.5 }}
      >
        Sign in anonymously
      </Button>
    </Box>
  );
}
