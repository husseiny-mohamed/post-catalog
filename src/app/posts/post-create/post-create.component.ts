import { Component, OnInit } from '@angular/core';

import { NgForm, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';

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

  get image() {
    return this.postForm.get('image');
  }
  imagePreview: string;
  constructor(private postService: PostService, private formBuilder: FormBuilder, private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.postForm = this.formBuilder.group({
      title: [null, [Validators.required, Validators.minLength(3)]],
      content: [null, Validators.required],
      image: [null, [Validators.required], [mimeType]]
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = { id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath };
          this.postForm.setValue({ title: this.post.title, content: this.post.content });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({ image: file });
    this.image.updateValueAndValidity();
    const fileReader: FileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      this.imagePreview = fileReader.result as string;
    };
  }
  onSavePost() {
    if (this.postForm.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.isLoading = true;
      this.postService.addPost(this.postForm.value.title, this.postForm.value.content, this.postForm.value.image);
    } else {
      this.postService.updatePost(this.postId, this.postForm.value.title, this.postForm.value.content);
    }
    this.postForm.reset();
  }
}
