---
title: "Laravel 学习笔记"
description: "Laravel ｜ Tutorial ｜ 笔记"
date: 2025-02-12
---

> [!NOTE]
> 课程来自 [30 Days to Learn Laravel 11](https://laracasts.com/series/30-days-to-learn-laravel-11)

## 基础入门

### 01 Hello, Laravel

项目初始化，需要先安装 [Herd](https://herd.laravel.com/)。

```bash
laravel new project-name
```

### 02 Your First Route and View

路由定义 (routes/web.php)

```php
Route::get('/', function () {
    return view('welcome');
});

Route::get('/jobs', [JobController::class, 'index'])->name('jobs.index');
```

控制器创建

```bash
php artisan make:controller JobController
```

### 03 Create a Layout File Using Laravel Components

Blade 组件创建

```bash
php artisan make:component Layout
```

组件使用和自定义插槽

```php
// resources/views/components/layout.blade.php
<!DOCTYPE html>
<html>
<head>
    <title>{{ $title ?? 'Default Title' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <header>
        {{ $header ?? '' }}
    </header>

    <main>
        {{ $slot }}
    </main>
</body>
</html>

// 使用组件
<x-layout>
    <x-slot name="header">
        页面标题
    </x-slot>

    <div>页面内容</div>
</x-layout>
```

### 04 Make a Pretty Layout Using TailwindCSS

安装 Tailwind

    1. 遵循 [tailwindcss 官网](https://tailwindcss.com/docs/installation/framework-guides/laravel/vite) 安装。
    2. v4 版本还需要配置 [postcss](https://tailwindcss.com/docs/installation/using-postcss)。
    3. 移除 `tailwind.config.js` 文件，直接在 `app.css` 中配置。

### 05 Style the Currently Active Navigation Link

导航链接实现

```php
<nav>
    <a href="{{ route('home') }}"
       class="{{ request()->routeIs('home') ? 'text-blue-500' : 'text-gray-500' }}">
        首页
    </a>
</nav>
```

## 路由和数据

### 06 View Data and Route Wildcards

路由参数

```php
Route::get('/jobs/{job}', [JobController::class, 'show']);

public function show(Job $job)
{
    return view('jobs.show', ['job' => $job]);
}
```

视图数据传递

```php
return view('jobs.index', [
    'jobs' => Job::latest()->paginate(10),
    'categories' => Category::all()
]);
```

### 07 Autoloading, Namespaces, and Models

模型创建

```bash
php artisan make:model Job -m
```

命名空间使用

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Job extends Model
{
    protected $fillable = ['title', 'description', 'salary'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
```

## Eloquent ORM

### 08 Introduction to Migrations

创建迁移

```bash
php artisan make:migration create_jobs_table
```

迁移文件示例

```php
public function up()
{
    Schema::create('jobs', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->text('description');
        $table->decimal('salary', 10, 2);
        $table->foreignId('company_id')->constrained();
        $table->timestamps();
    });
}
```

### 09 Meet Eloquent

基础查询

```php
// 查找
$job = Job::find(1);
$jobs = Job::where('salary', '>', 5000)->get();

// 创建
Job::create([
    'title' => '高级工程师',
    'description' => '职位描述...',
    'salary' => 15000
]);

// 更新
$job->update(['salary' => 16000]);

// 删除
$job->delete();
```

### 10 Model Factories

工厂定义

```php
// database/factories/JobFactory.php
public function definition()
{
    return [
        'title' => fake()->jobTitle(),
        'description' => fake()->paragraph(),
        'salary' => fake()->numberBetween(5000, 20000),
        'company_id' => Company::factory()
    ];
}
```

使用工厂

```php
// 测试中使用
Job::factory()->count(10)->create();
```

### 11-12 Eloquent Relationships

关联关系定义

```php
// 一对一
// Model/User
public function employer()
{
    return $this->hasOne(Employer::class);
}
// Model/Employer
public function user()
{
    return $this->belongsTo(User::class);
}

// 一对多
// Model/Job
public function employer()
{
    return $this->belongsTo(Employer::class);
}
// Model/Employer
public function jobs(): HasMany
{
    return $this->hasMany(Job::class);
}

// 多对多
// Model/Job
public function tags(): BelongsToMany
{
    return $this->belongsToMany(Tag::class);
}
// Model/Tag
public function jobs(): BelongsToMany
{
    return $this->belongsToMany(Job::class);
}
```

### 13 Eager Loading

解决 N+1 问题

```php
// 不好的做法
$jobs = Job::all();
foreach ($jobs as $job) {
    echo $job->company->name;
}

// 好的做法
$jobs = Job::with('company')->get();
foreach ($jobs as $job) {
    echo $job->company->name;
}
```

### 14 Pagination

分页实现

```php
// 控制器
public function index()
{
    $jobs = Job::latest()->paginate(10);
    return view('jobs.index', compact('jobs'));
}

// 视图
<div>
    {{ $jobs->links() }}
</div>
```

## 表单处理

### 16-17 Forms and Validation

表单创建

```php
<form method="POST" action="{{ route('jobs.store') }}">
    @csrf
    <input type="text" name="title" value="{{ old('title') }}">
    @error('title')
        <span class="text-red-500">{{ $message }}</span>
    @enderror
</form>
```

验证规则

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|min:3|max:255',
        'description' => 'required',
        'salary' => 'required|numeric|min:0'
    ]);

    Job::create($validated);
}
```

## 认证系统

### 20-23 Authentication

用户认证

```php
// 登录
public function login(Request $request)
{
  $attributes = request()->validate([
    'email' => ['required', 'email'],
    'password' => ['required']
  ]);

  if (! Auth::attempt($attributes)) {
    throw ValidationException::withMessages([
      'email' => 'Your provided credentials could not be verified.'
    ]);
  }

  request()->session()->regenerate();

  return redirect('/');
}
```

权限控制

1. 通过 `Policy` 进行权限控制

```php
Route::get('/jobs/{job}/edit', [JobController::class, 'edit'])->middleware('auth')->can('edit', 'job');

// 创建 Policy
php artisan make:policy JobPolicy --model=Job

// 在 Policy 中定义权限
public function edit(User $user, Job $job)
{
    return $job->employer->user_id === $user->id;
}
```

2. 通过 `Gate` 进行权限控制

```php
// 创建 Gate
php artisan make:gate JobPolicy

// 在 Gate 中定义权限
Gate::define('edit-job', function (User $user, Job $job) {
    return $job->employer->user_id === $user->id;
});

// 在控制器中使用 Gate
public function edit(Job $job)
{
    Gate::authorize('edit-job', $job);
    // 更新逻辑
}

// 在 Blade 中使用 Gate
@can('edit-job', $job)
    <a href="{{ route('jobs.edit', $job) }}">编辑</a>
@endcan
```

## 高级特性

### 24 Email

邮件发送，使用 `php artisan make:mail JobPosted` 创建邮件类。
在控制器中使用：`Mail::to($user)->send(new JobPosted($job));`

### 25 Queues

队列任务，例如添加一个邮件发送任务，执行命令：`php artisan queue:work`
也可以新建一个任务类，例如 `php artisan make:job ProcessJobApplication`，然后通过 `ProcessJobApplication::dispatch($jobApplication);` 分发任务。

```php
Mail::to($job->employer->user)->queue(
  new JobPosted($job)
);
```

```php
// 创建任务
php artisan make:job ProcessJobApplication

// 分发任务
ProcessJobApplication::dispatch($jobApplication);
```

## 项目实战

### 27-30 Final Project

- 完整的 CRUD 操作
- 文件上传
- 搜索功能
- 权限控制
- API 开发
- 测试驱动开发

详细代码示例请参考[项目源码](https://github.com/abeixiaolu/pixel-position)。
