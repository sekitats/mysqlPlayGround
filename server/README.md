## How to get started

```sh
$ docker-compose up -d
$ ./server/bin/setup.sh
$ cd server && npm run dev
```

### データを取り出す

```sql
-- 顧客の名前を一覧で出す
select CustomerName from Customers;
-- 商品から価格一覧を取り出す
select Price from Products;
-- 複数の列を指定する
-- 商品の名前と単価を一覧で取り出す
select ProductName, Price from Products;
-- 顧客から顧客名と住所を一覧で取り出す
select CustomerName, Address from Customers;

--- 以下 使用頻度低

-- 列に別名をつける
select ProductName as 商品名, Price as 価格 from Products;
-- 列の値に対して演算を行う
select ProductName as 商品名, Price * 1.05 as 税込価格 from Products;
-- 列同士で演算を行う
select  Weight / (Height / 100) / (Height / 100) as BMI from Employees;
-- 文字列の連結を行う
select concat(CustomerName, '様') as お名前 from Customers;
-- 平均単価を取り出す。（集合関数を使う）
select AVG(Price) from Products;
```

### ある条件でレコードを絞り込む

```sql
-- WHERE句でデータを絞り込む
select EmployeeName as 氏名 from Employees where Height >= 180;
-- 「〜子」という名前の人の人数を取り出す
select count(*) as 子のつく社員の人数 from Employees where EmployeeName LIKE '%子';

-- 列の値に条件を設定する
select ProductName as 商品名,
case
  when Price < 1000 then 'C'
  when Price < 2000 then 'B'
  else 'A'
end as ランク
from Products;

-- グループ単位で集計する
select PrefecturalID as 都道府県,
count(*) as 顧客数
from Customers
group by PrefecturalID;

select PrefecturalID as 都道府県,
CustomerClassID as 会員種別,
count(*) as 顧客数
from Customers
group by PrefecturalID, CustomerClassID;
```

グループ化を行う場合、選択リストで許可されるのは、グループ化のキーとなる列名か、あるいは集合関数のみです。`COUNT()`を使うなら `GROUP BY` はセット。

### GROUP BY でグループ化した結果からさらに HAVING 　で絞り込む

```sql
-- 顧客数が３人以上の都道府県を取り出す
select `PrefecturalID` as 都道府県,
count(*) as 顧客名
from `Customers`
group by PrefecturalID
having count(*) >= 3;
```

### 法人客（CustomerClassID = 1） で絞り込む

```sql
-- 法人客が２人以上の都道府県を取り出す
select `PrefecturalID` as 都道府県,
count(*) as 顧客数
from Customers
where `CustomerClassID` = 1
group by PrefecturalID
having count(*) >= 2;
```

### クロス集計

```sql
-- 社員の血液型別の人数を入社年度ごとに取り出す
select `HireFiscalYear` as 入社年度,
sum(
  case
    when BloodType = "A" then 1
    else 0
  end
) as A型,
sum(
  case
    when BloodType = "B" then 1
    else 0
  end
) as B型,
sum(
  case
    when BloodType = "O" then 1
    else 0
  end
) as O型,
sum(
  case
    when BloodType = "AB" then 1
    else 0
  end
) as AB型
from `Employees`
group by HireFiscalYear;
```

### 並び替え

ORDER BY によって並び替えを行うための基準となる列名を指定する

```sql
-- 商品の一覧を単価の安い順にソートする
select `ProductName` as 商品名 from Products order by Price;
```

### 重複を排除する DISTINCT

```sql
select distinct Address as 住所 from `Customers`;
```

## 結合

結合とは 2 つのテーブルをある条件でくっつけること。

無条件に 2 つのテーブルを丸ごとくっつけるのが「直積」。直積はテーブルの中に含まれる値が何であるかにかかわらず、T1 の全ての行に T2 の全ての行を組み合わせることで得られる。（T1 と T2 の総当たり）

結合は 2 つのテーブルの列間の関係（T1 の Col3 が T2 の列 1 と等しいという関係）を設定し、その関係を満足させる 2 つのテーブルの行を連結して 1 つにします。

### 副問い合わせ

副問い合わせ（サブクエリ）とは、中間結果を得るために、別の SQL 文の中で使用する SELECT 文です。
WHERE 句の条件として使ったり、選択リストの中や、FROM 句の中でテーブルの代わりとして使う場合がある。

```sql
select * from Products where
`ProductID` not in
(select ProductID from Sales);
```

`NOT IN` は比較演算子の一つ。

#### テーブルに別名をつける

```sql
select
  e.EmployeeID,
  e.EmployeeName
from
  Employees as e;
```

### テーブルの結合を行う

```sql
-- 都道府県別の顧客数を取り出す（Customers と Prefecturals の結合）
select Customers.PrefecturalID, Prefecturals.PrefecturalName as 都道府県名, count(*) as 顧客数
from Customers join Prefecturals on Customers.PrefecturalID = Prefecturals.PrefecturalID
group by Customers.PrefecturalID, Prefecturals.PrefecturalName;
```

```sql
-- 部門別の平均給与額を取り出す
select d.`DepartmentName` as 部門名, avg(s.Amount) as 部門別平均給与額
from Salary as s
join BelongTo as b
on s.EmployeeID = b.EmployeeID
join Departments as d
on b.`DepartmentID` = d.DepartmentID
group by d.DepartmentName;
```

### テーブルの結合を行う 2

Departments, Salary, BelongTo を結合する

```sql
select
  d.`DepartmentName` as 部門名,
  avg(s.Amount) as 平均給与
from
  Salary as s
    join
  BelongTo as b
    on s.`EmployeeID` = b.`EmployeeID`
      join
    `Departments` as d
      on d.`DepartmentID` = b.`DepartmentID`
group by d.`DepartmentName`
;
```

#### 名前付き SELECT 文としてのビュー

View の作成

```sql
create view AvgSalaryByDept
  (
    DepartmentName,
    AvgAmount
  )
as
select
  d.`DepartmentName` as 部門名,
  avg(s.Amount) as 平均給与
from
  Salary as s
    join
  BelongTo as b
    on s.`EmployeeID` = b.`EmployeeID`
      join
    `Departments` as d
      on d.`DepartmentID` = b.`DepartmentID`
group by d.`DepartmentName`
;

select * from AvgSalaryByDept where DepartmentName = '販売'
```

### 外部結合

結合処理は、普通に指定した場合では両方のテーブルの結合条件の列に値の入っているレコード同士しか結合しません。
そのため片方にしか値が入っていない場合は相手が見つからないため検索結果から除外されてしまう。こういう時に使うのは外部結合です。
外部結合は OUTER JOIN とも呼びます。外部結合に対して、普通の結合処理は内部結合あるいは INNER JOIN と呼びます。
なお、結合相手がない場合、本来値が入るはずの列には NULL がセットされます。演算に利用する場合は注意が必要。

フリスビーと骨は売れていないので、Sales にない。通常の結合処理をすると検索結果から除外される。
`left outer join` を使う

```sql
-- 全部の商品の平均販売単価を取り出す
select
  p.`ProductName`,
  avg(
    p.`Price` *
    case
      when s.`Quantity` is NULL then 0
      else s.`Quantity`
    end
  ) as 平均販売価格
from
  Products as p
    left outer join
  Sales as s
    on
  p.`ProductID` = s.`ProductID`
group by p.`ProductName`
;
```

RDBMS によっては、 `LEFT OUTER JOIN`だけでなく、`RIGHT OUTER JOIN`も使えます
LEFT と　 RIGHT は主体となる表が JOIN 句 の左右どちらかを指定するものです。

### 自己結合を行う

結合条件に（<）を使っているのは、これは１度出現したレコードを２度と出さないため。
（<>）は否定演算子。

```sql
select
  p1.`ProductName` as p1,
  p2.`ProductName` as p2,
  p1.`Price` + p2.`Price` as セット価格
from Products as p1
  join Products as p2
  on p1.`ProductID` < p2.`ProductID`
  and p1.`CategoryID` <> p2.`CategoryID`
where
  p1.`Price` + p2.`Price` > 2500
;
```

### 相関副問い合わせを使う

商品ごとの販売数量の平均を上回った日を一覧で出す。

相関副問い合わせとは、福問い合わせを呼び出す側の SELECT 文と、副問い合わせ側の SELECT 文が結合しながら結果を作るものです。

## 集合演算

集合演算は選択列の構成が同じ 2 つの問い合わせの間で、問い合わせ結果のメンバー同士の和集合（UNION）、共通集合（INTERSECT）、差集合（EXCEPT）を求めるものです。

### UNION ALL を使う

UNION ALL は 2 つの SELECT 文を 1 つにします。

```sql
-- 顧客と社員の名前一覧をだす
select
  CustomerName
from
  Customers
union all
select
  EmployeeName
from
  Employees
;
```

### UNION を使う

UNION ALL との違いは、UNION ALL が単純に結果を重ねるのに対して、UNION は結果セット同士をさらに混ぜ合わせて重複を排除するという点です。

```sql
select
  CustomerName
from
  Customers
union
select
  EmployeeName
from
  Employees
;
```

### INTERSECT を使う

MySQL では使えない

### EXCEPT を使う

MySQL では使えない

## CRUD

### レコードを１件追加する

```sql
insert into Products
(
  ProductID,
  ProductName,
  Price,
  CategoryID
)
values
(
  101,
  'サカナまっしぐら',
  270,
  5
)
;
```

### 副問い合わせを使って追加する

### レコードを更新する

```sql
update
 Customers
set
  Address = '世田谷たがやせ1丁目'
where
  CustomerID = 5
;
```

### 特定のレコードを更新する

### 更新条件に副問い合わせを使う

### 他のテーブルの値を使って更新する

### レコードを削除する

```sql
delete from Salary;
```

### 特定のレコードを削除する

```sql
delete
from
  Employees
where
 EmployeeID = 17
;
```

### 削除条件に副問い合わせを使う
