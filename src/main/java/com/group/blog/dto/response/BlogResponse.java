package com.group.blog.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BlogResponse {

    UUID id;
    String title;
    String slug;
    String banner;
    String description;
    String content;

    String draftContent;
    String draftBanner;

    boolean draft;
    // Đổi sang long cho đồng bộ với kết quả trả về từ JPA count()
    long totalLikes;
    long totalComments;
    long totalReads;

    LocalDateTime publishedAt;
    LocalDateTime updatedAt;
    LocalDateTime createdAt;

    // Tận dụng DTO UserResponse đã tạo trước đó để làm thông tin Tác giả
    UserResponse author;

    CategoryResponse category;
    Set<TagResponse> tags;

    // 🔥 THÊM TRƯỜNG NÀY: Để frontend biết user hiện tại đã like bài này chưa
    boolean isLikedByCurrentUser;

    boolean isBookmarkedByCurrentUser;
}