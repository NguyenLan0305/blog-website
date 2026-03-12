package com.group.blog.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Table(name="categories",indexes = {
        @Index(name = "idx_blog_slug", columnList = "slug"),
        @Index(name = "idx_blog_category", columnList = "category_id")
})
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;
    @Column(nullable = false, unique = true,length = 100)
    String name;
    @Column(nullable = false, unique = true,length = 150)
    String slug;
}
