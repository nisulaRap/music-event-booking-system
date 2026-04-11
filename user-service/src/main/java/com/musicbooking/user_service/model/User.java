package com.musicbooking.user_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String email;

    private String password;

    private String name;

    private String phone;

    private String role; 

    @JsonIgnore
    private String resetToken;

    public User(){}

    public String getId(){ return id; }
    public void setId(String id){ this.id = id; }

    public String getEmail(){ return email; }
    public void setEmail(String email){ this.email = email; }

    public String getPassword(){ return password; }
    public void setPassword(String password){ this.password = password; }

    public String getName(){ return name; }
    public void setName(String name){ this.name = name; }

    public String getPhone(){ return phone; }
    public void setPhone(String phone){ this.phone = phone; }

    public String getRole(){ return role; }
    public void setRole(String role){ this.role = role; }

    public String getResetToken(){ return resetToken; }
    public void setResetToken(String resetToken){ this.resetToken = resetToken; }
}
