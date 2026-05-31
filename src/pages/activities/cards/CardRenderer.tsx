/* 卡片渲染器 — 根据类型分发到对应卡片组件 */

import type { MessageCard, RecognitionRegion } from '../types'
import { UploadPromptCard } from './UploadPromptCard'
import { UploadedImagesCard } from './UploadedImagesCard'
import { RecognitionLoadingCard } from './RecognitionLoadingCard'
import { RecognitionResultCard } from './RecognitionResultCard'
import { ConfigFormCard } from './ConfigFormCard'
import { PublishSuccessCard } from './PublishSuccessCard'

interface CardRendererProps {
  card: MessageCard
  onUploadClick: () => void
  onConfirmRegions: (regions: RecognitionRegion[]) => void
}

export function CardRenderer({ card, onUploadClick, onConfirmRegions }: CardRendererProps) {
  switch (card.type) {
    case 'upload-prompt': return <UploadPromptCard onUploadClick={onUploadClick} />
    case 'uploaded-images': return <UploadedImagesCard images={card.images} />
    case 'recognition-loading': return <RecognitionLoadingCard />
    case 'recognition-result': return <RecognitionResultCard regions={card.regions} onConfirm={onConfirmRegions} />
    case 'config-form': return <ConfigFormCard components={card.components} />
    case 'publish-success': return <PublishSuccessCard url={card.url} />
    default: return null
  }
}
