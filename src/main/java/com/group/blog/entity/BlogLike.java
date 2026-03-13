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
@Table(name="blog_likes",uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id","blog_id"})
},indexes = {
        @Index(name="idx_like_blog", columnList="blog_id"),
        @Index(name="idx_like_user", columnList="user_id")
})
public class BlogLike {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id",nullable = false)
    Blog blog;

    LocalDateTime createdAt;

    @PrePersist
    void prePersist(){
        if(createdAt == null){
            createdAt = LocalDateTime.now();
        }
    }
}