import User from "../modules/user.js";
import { signToken } from "../services/jwtService.js";

// 注册
export async function register(req, res) {
  const { username, password, mobile, email, loginType = 'username' } = req.body;
  try {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "用户名已存在"
      });
    }

    // 如果提供了手机号，检查是否已存在
    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "手机号已被注册"
        });
      }
    }

    // 如果提供了邮箱，检查是否已存在
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "邮箱已被注册"
        });
      }
    }

    const userData = {
      username,
      password,
      loginType,
      lastLoginAt: new Date()
    };

    if (mobile) userData.mobile = mobile;
    if (email) userData.email = email;

    const user = await User.create(userData);
    const token = signToken({ id: user._id, username: user.username });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          mobile: user.mobile,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          loginType: user.loginType,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt
        }
      },
      message: "注册成功"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

// 登录
export async function login(req, res) {
  const { username, password, loginField } = req.body;
  try {
    let user;

    // 支持多种登录方式：用户名、手机号、邮箱
    if (loginField && loginField !== 'username') {
      if (loginField === 'mobile') {
        user = await User.findOne({ mobile: username });
      } else if (loginField === 'email') {
        user = await User.findOne({ email: username });
      }
    } else {
      // 智能匹配：先尝试用户名，再尝试手机号，最后尝试邮箱
      user = await User.findOne({ username });

      if (!user && /^1[3-9]\d{9}$/.test(username)) {
        // 如果输入的是手机号格式
        user = await User.findOne({ mobile: username });
      }

      if (!user && /@/.test(username)) {
        // 如果输入的是邮箱格式
        user = await User.findOne({ email: username });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "账号不存在"
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "密码错误"
      });
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({ id: user._id, username: user.username });
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          mobile: user.mobile,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          loginType: user.loginType,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt
        }
      },
      message: "登录成功"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

// 获取当前用户信息
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "用户不存在" });
    res.json({ user });
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
