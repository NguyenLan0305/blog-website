package com.group.blog.repository;

import com.group.blog.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    // Lấy tất cả comment gốc (parent_id là null) của một bài viết
    // Sắp xếp mới nhất lên đầu
    List<Comment> findByBlogIdAndParentIsNullOrderByCreatedAtDesc(UUID blogId);

    // Lấy tất cả câu trả lời (replies) của một comment cha
    List<Comment> findByParentIdOrderByCreatedAtAsc(UUID parentId);

    // Đếm tổng số comment của 1 bài viết
    long countByBlogId(UUID blogId);


}
