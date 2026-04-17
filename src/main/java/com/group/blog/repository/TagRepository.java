package com.group.blog.repository;


import com.group.blog.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
    public interface TagRepository extends JpaRepository<Tag, UUID> {
        Optional<Tag> findByName(String name);

    boolean existsByName(String name);

    // 🔥 CÂU LỆNH TỐI ƯU CHO MẠNG LƯỚI MANY-TO-MANY
    // Đếm xem có bao nhiêu Blog đang chứa Tag này
    @Query("SELECT t, (SELECT COUNT(b) FROM Blog b JOIN b.tags tag WHERE tag = t) FROM Tag t")
    List<Object[]> findAllTagsWithPostCount();
    }

