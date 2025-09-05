import User from "../modules/user.js";
import { signToken } from "../services/jwtService.js";

// 注册
export async function register(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    const token = signToken({ id: user._id, username: user.username });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// 登录
export async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "账号不存在" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "密码错误" });

    const token = signToken({ id: user._id, username: user.username });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 获取用户信息
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "用户不存在" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 更新用户信息
export async function updateProfile(req, res) {
  const { username } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 修改密码
export async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "用户不存在" });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(401).json({ message: "旧密码错误" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "密码修改成功" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 退出登录 (客户端处理即可)
export async function logout(req, res) {
  res.json({ message: "退出成功" });
}
