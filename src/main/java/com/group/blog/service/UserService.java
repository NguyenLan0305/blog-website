package com.group.blog.service;

import com.group.blog.dto.request.PasswordChangeRequest;
import com.group.blog.dto.request.UserCreatetionRequest;
import com.group.blog.dto.request.UserUpdateRequest;
import com.group.blog.dto.response.UserResponse;
import com.group.blog.entity.User;
import com.group.blog.enums.Role;
import com.group.blog.exception.AppException;
import com.group.blog.exception.ErrorCode;
import com.group.blog.mapper.UserMapper;
import com.group.blog.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE,makeFinal=true)
public class UserService {
 UserRepository userRepository;
 UserMapper userMapper;
 PasswordEncoder passwordEncoder;
 public UserResponse createUser(UserCreatetionRequest request){
  if(userRepository.existsByUsername(request.getUsername())) throw new AppException(ErrorCode.USER_EXITED);
  User u=userMapper.toUser(request);
  u.setPassword(passwordEncoder.encode(request.getPassword()));
  u.getRoles().add(Role.USER.name());
  User savedUser=userRepository.save(u);
  return userMapper.toUserResponse(savedUser);
 }

 public UserResponse updateUser(UUID id, UserUpdateRequest request){
  User u=userRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.USER_NOT_EXITED));
  userMapper.updateUser(u,request);
  return userMapper.toUserResponse(userRepository.save(u));
 }

 public void deleteUser(UUID id){
  if(!userRepository.existsById(id)) throw new AppException(ErrorCode.USER_NOT_EXITED);
  userRepository.deleteById(id);
 }

 public List<UserResponse> getUsers(){
  return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
 }

 public UserResponse getUser(UUID id){
  return userMapper.toUserResponse(userRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.USER_NOT_EXITED)));
 }
 public void changePassword(PasswordChangeRequest request) {
  // 1. Lấy ra username của người ĐANG ĐĂNG NHẬP từ cái Token
  var context = SecurityContextHolder.getContext();
  String currentUsername = context.getAuthentication().getName();

  // 2. Lấy User từ Database lên
  User user = userRepository.findByUsername(currentUsername)
          .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXITED));

  // 3. So sánh: Mật khẩu cũ (nhập vào) có khớp với mật khẩu đang lưu trong DB không?
  boolean isMatch = passwordEncoder.matches(request.getOldPassword(), user.getPassword());
  if (!isMatch) {
   throw new AppException(ErrorCode.PASSWORD_INCORRECT);
  }

  // 4. Kiểm tra: Mật khẩu mới và Nhập lại mật khẩu có giống nhau không?
  if (!request.getNewPassword().equals(request.getConfirmPassword())) {
   throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
  }

  // 5. Mọi thứ OK -> Băm (hash) mật khẩu mới và lưu đè lên mật khẩu cũ
  user.setPassword(passwordEncoder.encode(request.getNewPassword()));
  userRepository.save(user);
 }
}
