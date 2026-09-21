package com.timeright.tcc.model.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.timeright.tcc.model.entity.SalaoFoto;
public interface SalaoFotoRepository extends JpaRepository<SalaoFoto, Long> {
    List<SalaoFoto> findBySalaoIdOrderByIdAsc(Long salaoId);
}
