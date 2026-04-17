export const clerkAuthAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    main: "gap-4",
    socialButtonsBlockButton:
      "h-10 rounded-md border border-input bg-background shadow-none hover:bg-muted",
    socialButtonsBlockButtonText: "text-sm font-medium text-foreground",
    socialButtonsIconButton:
      "h-10 rounded-md border border-input bg-background",
    dividerLine: "bg-border",
    dividerText: "text-[11px] font-medium text-muted-foreground",
    formFieldLabel: "text-xs font-medium text-muted-foreground",
    formFieldInput:
      "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
    formFieldAction: "text-xs text-muted-foreground hover:text-foreground",
    formFieldErrorText: "text-xs",
    formButtonPrimary:
      "h-10 rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90",
    footerActionText: "text-xs text-muted-foreground",
    footerActionLink:
      "text-xs font-semibold text-foreground hover:text-primary",
    formResendCodeLink: "text-xs text-primary",
    otpCodeFieldInput:
      "h-10 w-10 rounded-md border border-input bg-background text-sm shadow-none",
    identityPreviewText: "text-sm",
    identityPreviewEditButton: "text-xs text-primary",
    formFieldHintText: "text-xs text-muted-foreground",
  },
} as const;
