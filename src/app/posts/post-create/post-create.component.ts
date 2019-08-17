import { Component, OnInit } from '@angular/core';

import { NgForm, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  postForm: FormGroup;
  isLoading = false;
  private mode = 'create';
  private postId: string;
  private post: Post;

  get title() {
    return this.postForm.get('title');
  }

  get content() {
    return this.postForm.get('content');
  }

  constructor(private postService: PostService, private formBuilder: FormBuilder, private route: ActivatedRoute) {
    this.postForm = formBuilder.group({
      title: [null, [Validators.required, Validators.minLength(3)]],
      content: [null, Validators.required]
    });
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = { id: postData._id, title: postData.title, content: postData.content };
          this.title.setValue(this.post.title);
          this.content.setValue(this.post.content);
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }
  onSavePost() {
    if (this.postForm.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.isLoading = true;
      this.postService.addPost(this.postForm.value.title, this.postForm.value.content);
    } else {
      this.postService.updatePost(this.postId, this.postForm.value.title, this.postForm.value.content);
    }
    // this.postForm.resetForm();
  }
}
