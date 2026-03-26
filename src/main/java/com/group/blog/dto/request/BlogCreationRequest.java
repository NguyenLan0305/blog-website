package com.group.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

//Frontend sẽ dùng class này để gửi dữ liệu lên khi tạo bài viết
public class BlogCreationRequest {

    @NotBlank(message = "TITLE_REQUIRED")
    String title;

    String banner;
    String description;

    @NotBlank(message = "CONTENT_REQUIRED")
    String content;

    boolean draft;

    @NotNull(message = "CATEGORY_REQUIRED")
    UUID categoryId; // Chỉ cần nhận ID của Category

    Set<String> tags; // Frontend chỉ cần gửi lên mảng String tên các tag (VD: ["Java", "Spring Boot"])
}