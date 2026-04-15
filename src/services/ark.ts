import type { AnalysisData } from '../types'

const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses'
const API_KEY = 'def40aee-f3f9-4416-9ae2-2b15c72a7f5a'
const MODEL = 'ep-20260412214701-ktxg2'

const SYSTEM_PROMPT = `你是一个追求异性的高手，对于青春男女生的心理和外在表现，有非常强的洞察，也有一套很厉害的追求异性的技巧！擅长于输出简短但有效的分析和建议。

你的任务是根据用户上传的朋友圈截图，分析目标对象的性格、兴趣、生活方式等，并生成一份实用的交友/恋爱攻略报告。

请按以下6个维度输出分析报告，使用 markdown 格式：

## 一、TA 的人物画像
- 性格关键词
- 兴趣爱好
- 生活方式
- 价值观倾向
- 社交风格

## 二、破冰聊天攻略
- 推荐的聊天话题（3-5 个具体话题）
- 聊天风格建议
- 开场白示例（3 条不同风格）
- 聊天禁忌

## 三、送礼攻略
- 推荐礼物清单（3-5 件，附推荐理由）
- 送礼时机建议
- 预算区间参考

## 四、约会方案
- 推荐约会场景（3 个方案，从轻松到正式递进）
- 每个方案包含：地点类型 + 活动内容 + 注意事项

## 五、关系推进路线图
- 阶段一：破冰期
- 阶段二：熟悉期
- 阶段三：暧昧期
- 阶段四：表白期

## 六、特别提醒
- TA 可能在意的细节
- TA 可能的雷区
- 与 TA 相处的黄金法则

要求：
- 所有建议必须基于截图内容推导，不能凭空编造
- 给出的建议要具体、可操作
- 语气温暖友好，像闺蜜/兄弟在支招
- 尊重对方隐私和边界`

const RELATIONSHIP_MAP: Record<string, string> = {
  stranger: '陌生人',
  acquaintance: '认识但不熟',
  friend: '普通朋友',
  flirting: '暧昧中',
}

const GOAL_MAP: Record<string, string> = {
  friendship: '想要进一步交朋友',
  romance: '想要发展恋爱关系',
}

function buildUserPrompt(data: AnalysisData): string {
  const { userInfo } = data
  const parts: string[] = ['请根据以下朋友圈截图分析这个人，并生成完整的攻略报告。']

  if (userInfo.myGender) {
    parts.push(`我的性别：${userInfo.myGender === 'male' ? '男' : '女'}`)
  }
  if (userInfo.targetGender) {
    parts.push(`对方性别：${userInfo.targetGender === 'male' ? '男' : '女'}`)
  }
  if (userInfo.relationship) {
    parts.push(`我们当前的关系：${RELATIONSHIP_MAP[userInfo.relationship]}`)
  }
  if (userInfo.goal) {
    parts.push(`我的目标：${GOAL_MAP[userInfo.goal]}`)
  }

  return parts.join('\n')
}

export async function analyzeImages(
  data: AnalysisData,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
) {
  const imageInputs = data.images.map(img => ({
    type: 'input_image' as const,
    image_url: img,
  }))

  const userPrompt = buildUserPrompt(data)

  const body = {
    model: MODEL,
    stream: true,
    input: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          ...imageInputs,
          {
            type: 'input_text',
            text: userPrompt,
          },
        ],
      },
    ],
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      onError(`API 请求失败 (${response.status}): ${errText}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError('无法读取响应流')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const jsonStr = trimmed.slice(5).trim()
        if (jsonStr === '[DONE]') {
          onDone()
          return
        }
        try {
          const parsed = JSON.parse(jsonStr)
          // Handle responses API streaming format
          if (parsed.type === 'response.output_text.delta' && parsed.delta) {
            onChunk(parsed.delta)
          }
          // Also handle chat/completions streaming format as fallback
          if (parsed.choices?.[0]?.delta?.content) {
            onChunk(parsed.choices[0].delta.content)
          }
          if (parsed.output_text) {
            onChunk(parsed.output_text)
          }
        } catch {
          // skip unparseable lines
        }
      }
    }

    onDone()
  } catch (err) {
    onError(`请求出错: ${err instanceof Error ? err.message : String(err)}`)
  }
}

// Non-streaming fallback
export async function analyzeImagesSync(data: AnalysisData): Promise<string> {
  const imageInputs = data.images.map(img => ({
    type: 'input_image' as const,
    image_url: img,
  }))

  const userPrompt = buildUserPrompt(data)

  const body = {
    model: MODEL,
    input: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          ...imageInputs,
          {
            type: 'input_text',
            text: userPrompt,
          },
        ],
      },
    ],
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API 请求失败 (${response.status})`)
  }

  const result = await response.json()
  return result.output?.[0]?.content?.[0]?.text || result.output_text || '分析结果为空'
}
