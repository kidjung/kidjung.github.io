---
title:  "facebookgo/inject를 이용하여 Golang에서의  DI를 해보자"

categories:
  - Go
tags:
  - [Go, Dev]

toc: true
toc_sticky: true
 
date: 2021-09-28
last_modified_at: 2021-09-28
---
- 예시 프로젝트 내용은 이해하기 쉽게 "김영한 강사님의 spring 강의"에서 사용했던 예제를 참고하여 만들었다.
Member정보를 등록하고 Member가 VIP인지 확인하여 할인 금액을 출력할 수 있도록 하였다.

- 의존성 주입의 경우 Spring사용의 경험이 있어 빗대어서 이해하였다.

실제 프로젝트에서는 config 부분과 테스트 코드를 나눠서 구현하여야겠지만, 여기서는 설명을 위해 한 소스파일에 설정 주입 과 로직 실행 모두 넣었다.

## 각 객체의 주입 설정 부분
주입을 받기 원하는 곳에 \``inject:""`\`를 붙여준다

```go
type MemberServiceImpl struct {
	Repo Repository `inject:""` // 주입 받기 위해 `inject:""` 붙임
}
```

## 유저를 저장하는 레포지토리
유저를 저장하는 `Repository` 인터페이스는 다음과 같다.
```go
type Repository interface {
	Save(member Member)`
	FindById(id int) Member
}
```


## 각 구현체 의존 부분

멤버를 관리하는 `MemberService` 인터페이스와 `MemberServiceImpl` 구현체이다.
유저를 저장하는 레포지토리 인터페이스를 주입받는다.


```go
type MemberService interface {
	Join(member Member)
	FindMember(id int) Member
}

type MemberServiceImpl struct {
	Repo Repository `inject:""`
}
```
주문을 처리하는 `OrderService` 인터페이스와 `OrderServiceImpl` 구현체이다.
유저를 저장하는 레포지토리와 할인 정책을 결정하는 DiscountPolicy 인터페이스를 주입받는다


```go
type OrderService interface {
	CreateOrder(id int, itemName string, itemPrice int) *Order
}

type OrderServiceImpl struct {
	Repository Repository `inject:""`
	DisPolicy  DiscountPolicy `inject:""`
}
```




## init.go의 Run() 부분

```go
func (mini MiniProject) Run() {
	member := Member{1,"kj",true}

	// 그래프 생성 (스프링의 스프링 컨테이너 역할 인 듯 하다.)
	var graph inject.Graph

	// 그래프에 오브젝트 제공
	err := graph.Provide(
		&inject.Object{Value: NewMemoryRepository()},
     		&inject.Object{Value: NewMemberServiceImplWithNoArgs(), Name: "memberServiceImpl"},
            	&inject.Object{Value: NewFixDiscountPolicy(1000)}),
		&inject.Object{Value: NewOrderServiceImpl(), Name: "orderServiceImpl"}
	if err != nil {
		fmt.Println(err)
		return
	}

	// 의존성을 주입 실행 부분
	err = graph.Populate()
	if err != nil {
		fmt.Println(err)
		return
	}
    
    
    
    	// ------------ 테스트 코드 작성 ---------------

	var memberService MemberService
	var orderService OrderService
    
	// 의존성 자동 주입이 완료된 구조체 인터페이스에 대입 name을 이용해서 graph에서 싱글턴 객체를 꺼내서 사용
	for _, obj := range graph.Objects() {
		if obj.Name == "memberServiceImpl" {
			memberService = obj.Value.(*MemberServiceImpl)
		} else if obj.Name == "orderServiceImpl" {
			orderService = obj.Value.(*OrderServiceImpl)
		}
	}
	memberService.Join(member)
	fmt.Println("멤버 찾기 결과: ",memberService.FindMember(1))

	fmt.Println("주문 생성 결과: " ,orderService.CreateOrder(1, "Mac", 100000))

	fmt.Println("의존성 그래프 존재하는 모든 객체 출력")
	for _, obj := range graph.Objects() {
		log.Printf("object known: %v\n", obj)
	}
```
## 실행결과
실행결과는 다음과 같고 정상적으로 주입이 되었음이 확인 가능하다.
```
멤버 찾기 결과:  {1 kj true}
주문 생성 결과:  &{1 Mac 100000 1000}
의존성 그래프 존재하는 모든 객체 출력
2021/08/03 16:07:15 object known: *modules.OrderServiceImpl named orderServiceImpl
2021/08/03 16:07:15 object known: *modules.MemberServiceImpl named memberServiceImpl
2021/08/03 16:07:15 object known: *modules.MemoryRepository
2021/08/03 16:07:15 object known: *modules.FixDiscountPolicy

```



참고: <https://pkg.go.dev/github.com/facebookgo/inject#section-readme>