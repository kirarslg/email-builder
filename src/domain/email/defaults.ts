import { createUid } from '../shared/id'
import type { BuilderBlock, BuilderRow, EmailFormData } from './types'

function createDefaultBuilderRow(layout = 1): BuilderRow {
  const columns = Array.from({ length: Math.max(1, Math.min(3, layout)) }, () => ({
    id: createUid('col'),
    blocks: [] as BuilderBlock[],
  }))

  return {
    id: createUid('row'),
    layout: columns.length,
    columns,
  }
}

export function createDefaultEmailFormData(): EmailFormData {
  const firstBuilderRow = createDefaultBuilderRow(1)

  return {
    subject: 'Заголовок письма',
    subjectHtml: '',
    hideSubject: false,
    hideGreeting: false,
    recipientName: 'коллега',
    toneKey: 'neutral',
    greeting: '',
    greetingHtml: '',
    bgOuter: '#edf2f6',
    bgBody: '#ffffff',
    textColor: '#111111',
    mutedColor: '#444444',
    marginTop: 28,
    marginBottom: 28,
        headerImages: [],
    headerLinkUrl: '',
    headerAlt: '',
    headerTitleEnabled: false,
    headerTitle: '',
    headerTitleHtml: '',
    headerDescEnabled: false,
    headerDesc: '',
    headerDescHtml: '',
    headerBlockAlignMode: 'left',
    builderHeadingSize: 22,
    builderHeadingColor: '#111111',
    builderGreetingSize: 14,
    builderGreetingColor: '#111111',
    intro: 'Пример ссылки в тексте:\nhttps://example.com\n\nИли просто URL:\nhttps://example.com',
    introHtml: '',
    hideIntro: false,
    linkColor: '#0b57d0',
    linkUnderline: 'underline',
    bullets: [],
    cta: '',
    ctaHtml: '',
    hideCta: false,
    buttonText: 'Открыть документ',
    buttonUrl: 'https://example.com',
    buttonAlign: 'left',
    buttonSize: 'm',
    buttonBgMode: 'solid',
    buttonGradDir: 'lr',
    buttonBg1: '#EDF2F6',
    buttonBg2: '#0b57d0',
    buttonFg: '#333333',
    buttonRadius: 10,
    buttonWidth: 191,
    withButton: true,
    closing: '',
    senderName: 'Иванов Иван',
    senderNameHtml: '',
    senderTitle: '',
    senderTitleHtml: '',
    senderCompany: '',
    senderCompanyHtml: '',
    senderPhone: '',
    senderPhoneHtml: '',
    senderPhones: [],
    signatureImage: null,
    signatureImageAlign: 'left',
    dividerColor: '#1f1f1f',
    withDivider: true,
    withSignature: true,
    preheader: '',
    builderRows: [firstBuilderRow],
    builderHeaderImages: [],
    builderActiveColumnId: firstBuilderRow.columns[0]?.id || null,
    builderSelectedBlockId: null,
    emailViewMode: 'inputs',
  }
}

export function createBuilderRow(layout = 1): BuilderRow {
  return createDefaultBuilderRow(layout)
}
