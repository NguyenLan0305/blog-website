package com.group.blog.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name="blog_views",uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id","blog_id"})}
)
//mỗi khi ai đó vào đọc bài, sẽ insert 1 dòng vào đây
public class BlogView {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    Blog blog;

    // Có thể lưu IP hoặc User_ID để tránh tính 1 người đọc nhiều lần
    String ipAddress;
    LocalDateTime viewedAt;

    @PrePersist
    void prePersist(){
        if(viewedAt == null){
            viewedAt = LocalDateTime.now();
        }
    }
}