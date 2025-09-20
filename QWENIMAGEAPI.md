# Qwen创建图片生成请求 API

本接口用于根据文本描述生成图片。生成图片的链接有效期为一小时，请及时下载保存。

---

## 请求地址

`POST /your-api-endpoint`

请求体格式：`application/json`

---

## 参数说明

| 参数名                | 类型      | 必填 | 说明                                                                                          |
|-----------------------|-----------|------|-----------------------------------------------------------------------------------------------|
| model                 | string    | 是   | 对应模型名称：`Qwen/Qwen-Image`                                 |
| prompt                | string    | 是   | 图片生成的文本描述                                                                            |
| negative_prompt       | string    | 否   | 反向描述文本（不希望出现的内容）                                                              |
| image_size            | string    | 是   | 图片分辨率，格式为 `宽x高`，如：`512x512`。建议使用推荐值。                                    |
| seed                  | integer   | 否   | 随机种子值，控制图片生成的随机性                                                              |
| num_inference_steps   | integer   | 否   | 生成步骤数，默认值：20                                                                        |
| guidance_scale        | number    | 否   | 匹配度控制，范围：0~20，值越高越贴合描述，越低越有创造性，默认值：7.5                          |
| cfg                   | number    | 否   | 仅限 Qwen/Qwen-Image 模型，CFG 指引值，范围：0.1~20，官方推荐：50步，CFG=4.0                   |
| image                 | string    | 否   | 可选，基础图片（如用于图像编辑或混合）                                                        |

image_size可选值：
	* "1328x1328" (1:1)
	* "1664x928" (16:9)
	* "928x1664" (9:16)
	* "1472x1140" (4:3)
	* "1140x1472" (3:4)
	* "1584x1056" (3:2)
	* "1056x1584" (2:3)

---

### 参数示例说明

- **model**: 必须填写，决定使用哪个图片生成模型。
- **prompt**: 填写你想生成图片的具体描述。
- **image_size**: 推荐根据模型建议填写，比如 `512x512`。
- **guidance_scale**: 越高越贴合文本，越低越自由。
- **cfg**: 仅 Qwen/Qwen-Image 有效，推荐 4.0。
- **seed**: 相同 seed 可复现图片结果。
- **num_inference_steps**: 步数越高图片越细致，但耗时更长。

---

## 请求示例

```json
{
  "model": "Qwen/Qwen-Image",
  "prompt": "an island near sea, with seagulls, moon shining over the sea, light house, boats in the background, fish flying over the sea",
  "negative_prompt": "",
  "image_size": "512x512",
  "seed": 42,
  "num_inference_steps": 20,
  "guidance_scale": 7.5,
  "cfg": 4.0
}
```

---

## 返回结果

成功时返回图片 URL（有效期一小时）：

```json
{
  "image_url": "https://your-domain.com/generated-image.png"
}
```

---

## JavaScript 调用示例

```javascript
async function generateImage() {
  const response = await fetch('https://your-api-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen-Image',
      prompt: 'an island near sea, with seagulls, moon shining over the sea, light house, boats in the background, fish flying over the sea',
      image_size: '512x512',
      seed: 42,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      cfg: 4.0
    })
  });
  const data = await response.json();
  console.log('图片地址:', data.image_url);
}
```

---

## 注意事项

- 图片链接有效期仅一小时，请及时下载。
- 模型和参数可能定期调整，请关注官方公告。
- guidance_scale 和 cfg 参数影响图片生成的贴合度与创造性，可根据实际需求调整。

---

## 推荐参数值

- Qwen/Qwen-Image 官方推荐：`num_inference_steps = 50`, `cfg = 4.0`

---

## 错误处理

如参数不合法或模型不可用，接口将返回错误信息，请根据返回内容排查问题。

---

# Qwen修改图片请求 API

本接口用于根据图片和文本描述修改原图片。缺详细描述，仅有请求和应答信息体。

---

## 请求

```json
{
    "image": "data:image/jpeg;base64,...",
    "cfg": 4,
    "num_inference_steps": 20,
    "prompt": "Wearing Manchester United soccer team jersey.",
    "model": "Qwen/Qwen-Image-Edit"
}
```

---

## 应答

```json
{
    "images": [
        {
            "url": "https://bizyair-dev.oss-cn-shanghai.aliyuncs.com/outputs%2F29674427-c551-4f50-b7dc-ecc1c3b98a41_35d25256405cb601ec810093ff655c6c_ComfyUI_6432ca5c_00001_.png?OSSAccessKeyId=LTAI5tPza7RAEKed35dCML5U&Expires=1758388631&Signature=YVUg1wnxH%2Bes%2FkkDRU1ZgIQ2b8s%3D"
        }
    ],
    "timings": {
        "inference": 0.525
    },
    "seed": 1266341133,
    "shared_id": "0",
    "data": [
        {
            "url": "https://bizyair-dev.oss-cn-shanghai.aliyuncs.com/outputs%2F29674427-c551-4f50-b7dc-ecc1c3b98a41_35d25256405cb601ec810093ff655c6c_ComfyUI_6432ca5c_00001_.png?OSSAccessKeyId=LTAI5tPza7RAEKed35dCML5U&Expires=1758388631&Signature=YVUg1wnxH%2Bes%2FkkDRU1ZgIQ2b8s%3D"
        }
    ],
    "created": 1758385031
}
```