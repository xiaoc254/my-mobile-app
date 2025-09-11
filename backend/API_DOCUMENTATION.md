# 宠物管理API接口文档

## 基础信息
- 基础URL: `http://localhost:3000/api`
- 所有宠物相关接口都需要身份验证（JWT Token）
- 请求头需要包含: `Authorization: Bearer <token>`

## 接口列表

### 1. 添加宠物
**POST** `/pets`

#### 请求参数
```json
{
  "nickname": "布丁",
  "type": "cat",
  "gender": "female", 
  "avatar": "base64_image_string_or_url",
  "startDate": "2024/01/15 10:30",
  "weight": 3.5
}
```

#### 参数说明
- `nickname`: 宠物昵称，必填，2-20个字符
- `type`: 宠物类型，必填，可选值：`dog`(汪星人)、`cat`(喵星人)、`other`(其它星人)
- `gender`: 宠物性别，必填，可选值：`male`(弟弟)、`female`(妹妹)、`neutered_male`(绝育弟弟)、`neutered_female`(绝育妹妹)
- `avatar`: 宠物头像，可选，base64字符串或图片URL
- `startDate`: 开始日期，必填，格式：`yyyy/mm/dd hh:mm`
- `weight`: 体重，必填，0.1-200公斤之间

#### 成功响应
```json
{
  "success": true,
  "message": "宠物添加成功",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nickname": "布丁",
    "type": "cat",
    "gender": "female",
    "avatar": "base64_image_string_or_url",
    "startDate": "2024-01-15T02:30:00.000Z",
    "weight": 3.5,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "请填写所有必填字段"
}
```

### 2. 获取用户所有宠物
**GET** `/pets`

#### 成功响应
```json
{
  "success": true,
  "message": "获取宠物列表成功",
  "data": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "nickname": "布丁",
      "type": "cat",
      "gender": "female",
      "avatar": "base64_image_string_or_url",
      "startDate": "2024-01-15T02:30:00.000Z",
      "weight": 3.5,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. 获取单个宠物详情
**GET** `/pets/:petId`

#### 路径参数
- `petId`: 宠物ID

#### 成功响应
```json
{
  "success": true,
  "message": "获取宠物详情成功",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nickname": "布丁",
    "type": "cat",
    "gender": "female",
    "avatar": "base64_image_string_or_url",
    "startDate": "2024-01-15T02:30:00.000Z",
    "weight": 3.5,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. 更新宠物信息
**PUT** `/pets/:petId`

#### 请求参数（可选）
```json
{
  "nickname": "新昵称",
  "weight": 4.0,
  "avatar": "new_avatar_url"
}
```

#### 成功响应
```json
{
  "success": true,
  "message": "宠物信息更新成功",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nickname": "新昵称",
    "type": "cat",
    "gender": "female",
    "avatar": "new_avatar_url",
    "startDate": "2024-01-15T02:30:00.000Z",
    "weight": 4.0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 5. 删除宠物
**DELETE** `/pets/:petId`

#### 成功响应
```json
{
  "success": true,
  "message": "宠物删除成功"
}
```

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token无效或过期） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript (Fetch API)
```javascript
// 添加宠物
const addPet = async (petData) => {
  const response = await fetch('/api/pets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(petData)
  });
  
  const result = await response.json();
  return result;
};

// 获取宠物列表
const getPets = async () => {
  const response = await fetch('/api/pets', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

### Axios
```javascript
import axios from 'axios';

// 配置axios默认headers
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// 添加宠物
const addPet = async (petData) => {
  const response = await axios.post('/api/pets', petData);
  return response.data;
};

// 获取宠物列表
const getPets = async () => {
  const response = await axios.get('/api/pets');
  return response.data;
};
```
