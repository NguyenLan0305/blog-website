package com.group.blog.controller;

import com.group.blog.dto.request.ApiResponse;
import com.group.blog.dto.request.PasswordChangeRequest;
import com.group.blog.dto.request.UserCreatetionRequest;
import com.group.blog.dto.request.UserUpdateRequest;
import com.group.blog.dto.response.UserResponse;
import com.group.blog.entity.User;
import com.group.blog.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE,makeFinal=true)
public class UserController {
   UserService userService;
   @PostMapping()
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreatetionRequest request){
       ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
       apiResponse.setResult(userService.createUser(request));
       return apiResponse;
   }

    @GetMapping
    ApiResponse<List<UserResponse>> getUsers() {
        var authentication= SecurityContextHolder.getContext().getAuthentication();
        // log thông tin về username và role của user này ra
        log.info("Username: {}",authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority-> log.info(grantedAuthority.getAuthority()));
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable("userId") UUID userId) {
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUser(userId));
        return apiResponse;
    }

    @PutMapping("/{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable("userId") UUID userId, @RequestBody @Valid UserUpdateRequest request) {
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.updateUser(userId, request));
        return apiResponse;
    }

    @PutMapping("/my-profile/change-password")
    public ApiResponse<String> changePassword(@RequestBody @Valid PasswordChangeRequest request) {
        // Gọi Service xử lý logic
        userService.changePassword(request);
        // Trả về thông báo thành công
        return ApiResponse.<String>builder()
                .result("Password has been changed successfully")
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable("userId") UUID userId) {
        userService.deleteUser(userId);
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setResult("User has been deleted");
        return apiResponse;
    }

}
