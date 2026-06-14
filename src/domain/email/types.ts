export type EmailToneKey = 'neutral' | 'formal' | 'friendly' | 'direct'
export type ButtonBackgroundMode = 'solid' | 'gradient'
export type ButtonSize = 's' | 'm'
export type HorizontalAlign = 'left' | 'center' | 'right'
export type LinkUnderlineMode = 'underline' | 'none'

export interface UploadedImage {
  src: string
  name: string
  width?: number
  height?: number
}

export interface SignatureImage extends UploadedImage {
  width: number
  height: number
}

export type BuilderBlockType =
  | 'header'
  | 'greeting'
  | 'heading'
  | 'text'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'image'

export interface BuilderBlockBase {
  id: string
  type: BuilderBlockType
}

export interface BuilderHeaderBlock extends BuilderBlockBase {
  type: 'header'
}

export interface BuilderTextBlock extends BuilderBlockBase {
  type: 'greeting' | 'heading' | 'text'
  text: string
}

export interface BuilderButtonBlock extends BuilderBlockBase {
  type: 'button'
  text: string
  url: string
}

export interface BuilderDividerBlock extends BuilderBlockBase {
  type: 'divider'
}

export interface BuilderSpacerBlock extends BuilderBlockBase {
  type: 'spacer'
  size: number
}

export interface BuilderImageBlock extends BuilderBlockBase {
  type: 'image'
  src: string
  name: string
}

export type BuilderBlock =
  | BuilderHeaderBlock
  | BuilderTextBlock
  | BuilderButtonBlock
  | BuilderDividerBlock
  | BuilderSpacerBlock
  | BuilderImageBlock

export interface BuilderColumn {
  id: string
  blocks: BuilderBlock[]
}

export interface BuilderRow {
  id: string
  layout: number
  columns: BuilderColumn[]
}

export interface EmailFormData {
  subject: string
  subjectHtml: string
  hideSubject: boolean
  hideGreeting: boolean
  recipientName: string
  toneKey: EmailToneKey
  greeting: string
  greetingHtml: string
  bgOuter: string
  bgBody: string
  textColor: string
  mutedColor: string
  marginTop: number
  marginBottom: number
  headerImages: UploadedImage[]
  headerLinkUrl: string
  headerAlt: string
  headerTitleEnabled: boolean
  headerTitle: string
  headerTitleHtml: string
  headerDescEnabled: boolean
  headerDesc: string
  headerDescHtml: string
  headerBlockAlignMode: HorizontalAlign
  builderHeadingSize: number
  builderHeadingColor: string
  builderGreetingSize: number
  builderGreetingColor: string
  intro: string
  introHtml: string
  hideIntro: boolean
  linkColor: string
  linkUnderline: LinkUnderlineMode
  bullets: string[]
  cta: string
  ctaHtml: string
  hideCta: boolean
  buttonText: string
  buttonUrl: string
  buttonAlign: HorizontalAlign
  buttonSize: ButtonSize
  buttonBgMode: ButtonBackgroundMode
  buttonGradDir: string
  buttonBg1: string
  buttonBg2: string
  buttonFg: string
  buttonRadius: number
  buttonWidth: number | null
  withButton: boolean
  closing: string
  senderName: string
  senderNameHtml: string
  senderTitle: string
  senderTitleHtml: string
  senderCompany: string
  senderCompanyHtml: string
  senderPhone: string
  senderPhoneHtml: string
  senderPhones: string[]
  signatureImage: SignatureImage | null
  signatureImageAlign: HorizontalAlign
  dividerColor: string
  withDivider: boolean
  withSignature: boolean
  preheader: string
  builderRows: BuilderRow[]
  builderHeaderImages: UploadedImage[]
  builderActiveColumnId: string | null
  builderSelectedBlockId: string | null
  emailViewMode: 'inputs' | 'builder'
}
