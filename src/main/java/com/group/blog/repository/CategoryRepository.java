package com.group.blog.repository;

import com.group.blog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    boolean existsByName(String name);

    // 🔥 CÂU TRUY VẤN TỐI ƯU: Lấy Category và đếm số Blog thuộc về nó
    @Query("SELECT c, (SELECT COUNT(b) FROM Blog b WHERE b.category = c) FROM Category c")
    List<Object[]> findAllCategoriesWithPostCount();
}