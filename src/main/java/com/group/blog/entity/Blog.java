package com.group.blog.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name="blogs")
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    String title;

    @Column(nullable = false,unique = true,length=150)
    String slug;
    String banner;
    String description;

    @Column(columnDefinition = "TEXT")
    String content;

    boolean draft;
    int totalLikes=0;
    int totalComments=0;
    int totalReads=0;
    LocalDateTime publishedAt;
    LocalDateTime updatedAt;
    LocalDateTime createdAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    Category category;

    @ManyToMany
    @JoinTable(
            name = "blog_tags",
            joinColumns = @JoinColumn(name = "blog_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"),
            uniqueConstraints = {
                    @UniqueConstraint(columnNames = {"blog_id","tag_id"})
            }
    )
    Set<Tag> tags;

    @PrePersist
    void prePersist(){
        createdAt = LocalDateTime.now();

        if(!draft && publishedAt == null){
            publishedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    void preUpdate(){
        updatedAt = LocalDateTime.now();
    }
}