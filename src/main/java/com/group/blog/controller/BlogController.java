package com.group.blog.controller;

import com.group.blog.dto.request.ApiResponse;
import com.group.blog.dto.request.BlogCreationRequest;
import com.group.blog.dto.request.BlogUpdateRequest;
import com.group.blog.dto.response.BlogResponse;
import com.group.blog.service.BlogService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/blogs") // Định tuyến gốc cho tất cả API trong này
@RequiredArgsConstructor  // Dùng Required thay vì AllArgs cho chuẩn
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogController {

    BlogService blogService;

    // 1. Tạo bài viết mới
    @PostMapping
    public ApiResponse<BlogResponse> createBlog(@RequestBody @Valid BlogCreationRequest request) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.createBlog(request))
                .build();
    }

    // 2. Lấy danh sách toàn bộ bài viết
    @GetMapping
    public ApiResponse<List<BlogResponse>> getAllBlogs() {
        return ApiResponse.<List<BlogResponse>>builder()
                .result(blogService.getAllBlogs())
                .build();
    }

    // 3. Lấy chi tiết 1 bài viết theo ID
    @GetMapping("/{id}")
    public ApiResponse<BlogResponse> getBlogById(@PathVariable UUID id) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.getBlogById(id))
                .build();
    }

    // 4. Cập nhật bài viết
    @PutMapping("/{id}")
    public ApiResponse<BlogResponse> updateBlog(
            @PathVariable UUID id,
            @RequestBody @Valid BlogUpdateRequest request) {
        return ApiResponse.<BlogResponse>builder()
                .result(blogService.updateBlog(id, request))
                .build();
    }

    // 5. Xóa bài viết
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteBlog(@PathVariable UUID id) {
        blogService.deleteBlog(id);
        return ApiResponse.<String>builder()
                .result("Bài viết đã được xóa thành công")
                .build();
    }
}