import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { IssueService, Issue } from '../../core/services/issue.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './issues.component.html'
})
export class IssuesComponent implements OnInit {
  private issueService = inject(IssueService);

  issues = signal<Issue[]>([]);
  stats = signal<Record<string, number>>({ 'Open': 0, 'In Progress': 0, 'Closed': 0 });


  // Filters
  searchControl = new FormControl('');
  selectedStatus = '';
  selectedSeverity = '';

  ngOnInit() {
    this.loadIssues();
    this.loadStats();

    // Debounce the search input by 300ms
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadIssues();
    });
  }

  loadIssues() {
    // Map 'searchControl' value to the 'q' parameter your service expects
    const filters = {
      q: this.searchControl.value || undefined,
      status: this.selectedStatus || undefined,
      severity: this.selectedSeverity || undefined
    };

    this.issueService.getAll(filters).subscribe({
      next: (data) => this.issues.set(data),
      error: (err: HttpErrorResponse) => console.error('Error loading issues', err)
    });
  }

  loadStats() {
    this.issueService.stats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err: HttpErrorResponse) => console.error('Error loading stats', err)
    });
  }

  onFilterChange() {
    this.loadIssues();
  }

  deleteIssue(id: string | undefined) {
    if (!id) return;

    if (confirm('Delete this issue?')) {
      this.issueService.remove(id).subscribe({
        next: () => {
          this.loadIssues();
          this.loadStats(); // Reload the counts after a delete
        },
        error: (err: HttpErrorResponse) => console.error('Error deleting issue', err)
      });
    }
  }
}