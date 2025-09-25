package com.project1.smart_diary.repository;

import com.project1.smart_diary.entity.BaseEntity;
import com.project1.smart_diary.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    //Optional<UserEntity> findByEmail(String email);
    UserEntity findByEmail(String email);
    boolean existsByEmail(String email);

}
