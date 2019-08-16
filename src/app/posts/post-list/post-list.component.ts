import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: 'post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  sub: Subscription;
  constructor(private postService: PostService) {}

  ngOnInit() {
    this.postService.getPosts();
    this.postService.postAdded$.subscribe((posts) => {
      this.posts = posts;
    });
  }
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  deletePost(postId: string) {
    this.postService.deletePost(postId);
  }
}
